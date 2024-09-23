require("dotenv").config();
const { App } = require("@slack/bolt");
const trafficLightProcess = require("./blockKits/trafficLightProcess");
const { initDb, upsertTlSettings, getTlSettings } = require("./db/index");
const generateHomeView = require("./blockKits/home");

const defaultValues = {
	question: " How confident are you in achieving our sprint goals?",
	timeout: 10,
	first_button_text: "On track",
	first_button_emoji: ":white_check_mark:",
	second_button_text: "Uncertain",
	second_button_emoji: ":warning:",
	third_button_text: "At Risk",
	third_button_emoji: ":fire:",
};
// Initialize the database
initDb();

// Initializes your app with your bot token and signing secret
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

let hasVotingStarted = false;
let messageTs = "";
let channelId = "";
const botCommand = process.env.BOT_COMMAND || "light";
let timeout;

// Listens to incoming messages that contain "/light"
app.command(botCommand, async ({ ack, body, client, logger }) => {
	await ack();
	hasVotingStarted = false;
	const { team_id, channel_id } = body;
	channelId = channel_id;
	let getChannelSettings = await getTlSettings(team_id);
	if (!getChannelSettings) {
		upsertTlSettings({ team_id });
		getChannelSettings = defaultValues;
	}
	try {
		const { ts } = await client.chat.postMessage({
			text: "Voting has started!",
			channel: channelId,
			blocks: trafficLightProcess({
				revealFlag: false,
				startSession: true,
				...getChannelSettings,
			}),
		});
		messageTs = ts ?? "";
	} catch (error) {
		logger.error(error);
	}
});

// Listens to events when the app home is opened
app.event("app_home_opened", async ({ body, client }) => {
	try {
		const generatedHomeView = await generateHomeView(body?.team_id);

		await client.views.publish({
			user_id: event.user,
			view: generatedHomeView,
		});
	} catch (error) {
		console.error("Error opening app home:", error);
	}
});

// Save Settings from the Home tab
app.action("tl_save_settings", async ({ ack, body, client }) => {
	await ack();
	const username = body.user.username || body.user.name || body.user.id;
	const userId = body.user.id;
	const team_id = body?.team?.id;
	const { values } = body.view.state;
	const { value: question } = values.tl_question_input_block.tl_question_input;
	const { value: timeout } =
		values.tl_voting_duration.tl_voting_duration_action.selected_option;
	const { value: first_button_text } =
		values.tl_button_1_input.tl_buttons_input_1;
	const { value: second_button_text } =
		values.tl_button_2_input.tl_buttons_input_2;
	const { value: third_button_text } =
		values.tl_button_3_input.tl_buttons_input_3;
	const { value: first_button_emoji } =
		values.tl_button_1_emoji.tl_buttons_emoji_1;
	const { value: second_button_emoji } =
		values.tl_button_2_emoji.tl_buttons_emoji_2;
	const { value: third_button_emoji } =
		values.tl_button_3_emoji.tl_buttons_emoji_3;
	const toUpsert = {
		team_id,
		question,
		timeout: Number.parseInt(timeout),
		first_button_text,
		first_button_emoji,
		second_button_text,
		second_button_emoji,
		third_button_text,
		third_button_emoji,
		updated_at: new Date().toISOString(),
		updated_by: username,
	};
	upsertTlSettings(toUpsert);
	await client.views.publish({
		user_id: userId,
		view: await generateHomeView(team_id),
	});
});
// Update Home Tab to show the preview of the button 1
app.action(/^tl_update_preview_[123]$/, async ({ ack, body, client }) => {
	await ack();
	const {
		tl_button_1_input,
		tl_button_1_emoji,
		tl_button_2_input,
		tl_button_2_emoji,
		tl_button_3_input,
		tl_button_3_emoji,
	} = body.view.state.values;
	const first_button_text = tl_button_1_input.tl_buttons_input_1.value;
	const first_button_emoji = tl_button_1_emoji.tl_buttons_emoji_1.value;
	const second_button_text = tl_button_2_input.tl_buttons_input_2.value;
	const second_button_emoji = tl_button_2_emoji.tl_buttons_emoji_2.value;
	const third_button_text = tl_button_3_input.tl_buttons_input_3.value;
	const third_button_emoji = tl_button_3_emoji.tl_buttons_emoji_3.value;
	const newBlocks = body.view.blocks.map((block) => {
		if (block.block_id === "tl_preview_block_1") {
			block.text.text = `Button preview:    *${first_button_text}* ${first_button_emoji}`;
		}
		if (block.block_id === "tl_preview_block_2") {
			block.text.text = `Button preview:    *${second_button_text}* ${second_button_emoji}`;
		}
		if (block.block_id === "tl_preview_block_3") {
			block.text.text = `Button preview:    *${third_button_text}* ${third_button_emoji}`;
		}
		return block;
	});
	await client.views.publish({
		user_id: body.user.id,
		view: {
			type: "home",
			blocks: newBlocks,
		},
	});
});

// Listen to the Votes submitted by the users
app.action(
	{ block_id: "tl-vote-block" },
	async ({ ack, payload, context, respond, client }) => {
		await ack();
		const getChannelSettings = await getTlSettings(context.teamId);
		// update participants
		const { value } = payload;
		const { userId } = context;
		const userInfo = await client.users.info({ user: userId });
		const participant = {
			name: userInfo?.user?.name,
			image: userInfo?.user?.profile?.image_48,
			id: userInfo?.user?.id,
			vote: value,
		};
		await respond({
			replace_original: true,
			blocks: trafficLightProcess({
				revealFlag: false,
				participant,
				...getChannelSettings,
			}),
		});
		// Start the timer if it's the first vote
		if (!hasVotingStarted) {
			timeout = setTimeout(async () => {
				try {
					await client.chat.update({
						replace_original: true,
						channel: channelId,
						ts: messageTs,
						blocks: trafficLightProcess({
							question: getChannelSettings?.question,
							revealFlag: true,
						}),
					});
				} catch (error) {
					console.error("Error updating message:", error);
				}
			}, getChannelSettings.timeout * 1000);
			hasVotingStarted = true;
		}
	},
);

// Show the results of the voting before the timeout
app.action(
	{ block_id: "tl-show_results" },
	async ({ ack, client, context }) => {
		await ack();
		const tlSettings = await getTlSettings(context.teamId);
		try {
			await client.chat.update({
				replace_original: true,
				channel: channelId,
				ts: messageTs,
				blocks: trafficLightProcess({
					question: tlSettings.question,
					revealFlag: true,
				}),
			});
			timeout && clearTimeout(timeout);
		} catch (error) {
			console.error("Error updating message:", error);
		}
	},
);

(async () => {
	// Start your app
	await app.start(process.env.PORT || 3000);
	console.log("Slack Traffic Light app is running!");
})();
