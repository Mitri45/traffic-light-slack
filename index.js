require("dotenv").config();
const { modal } = require("./blockKits/modal");
const { trafficLightProcess } = require("./blockKits/trafficLightProcess");
const { App } = require("@slack/bolt");

// Initializes your app with your bot token and signing secret
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

let question = process.env.DEFAULT_QUESTION;
let channelId = "";
let hasVotingStarted = false;
let messageTs = "";
let timeout = 0;

app.command(process.env.BOT_COMMAND, async ({ ack, body, client, logger }) => {
	await ack();
	hasVotingStarted = false;
	const { channel_id, trigger_id, text } = body;

	channelId = channel_id;
	try {
		if (text) {
			question = text.trim();
		}
		const result = await client.views.open({
			// Pass a valid trigger_id within 3 seconds of receiving it
			trigger_id,
			// View payload
			view: modal(question),
		});
		logger.info(result);
	} catch (error) {
		logger.error(error);
	}
});

app.view("tl-start-session-modal", async ({ ack, payload, client, logger }) => {
	await ack();
	try {
		const { state } = payload;
		if (!state) return;
		const {
			tl_question_input_block: { tl_question_input },
			tl_voting_duration: { tl_voting_duration_action },
		} = state.values;
		question = tl_question_input?.value;
		timeout = Number.parseInt(tl_voting_duration_action.selected_option.value);
		const { ts } = await client.chat.postMessage({
			text: "Something went wrong with the Modal if you see this text",
			channel: channelId,
			blocks: trafficLightProcess({
				question,
				revealFlag: false,
				timeout,
				startSession: true,
			}),
		});
		messageTs = ts;
	} catch (error) {
		logger.error(error);
	}
});

app.action(
	{ block_id: "tl-vote-block" },
	async ({ ack, payload, context, respond, client }) => {
		await ack();
		// update participants
		const { value } = payload;
		const { userId } = context;
		const userInfo = await client.users.info({ user: userId });
		const participant = {
			name: userInfo.user.name,
			image: userInfo.user.profile.image_48,
			id: userInfo.user.id,
			vote: value,
		};

		await respond({
			replace_original: true,
			blocks: trafficLightProcess({
				question,
				revealFlag: false,
				timeout,
				participant,
			}),
		});
		// Start the timer if it's the first vote
		if (!hasVotingStarted) {
			setTimeout(async () => {
				try {
					await client.chat.update({
						replace_original: true,
						channel: channelId,
						ts: messageTs,
						blocks: trafficLightProcess({ question, revealFlag: true }),
					});
				} catch (error) {
					console.error("Error updating message:", error);
				}
			}, timeout * 1000);
			hasVotingStarted = true;
		}
	},
);

(async () => {
	// Start your app
	await app.start(process.env.PORT || 3000);
	console.log("Slack Traffic Light app is running!");
})();
