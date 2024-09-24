const { getTlSettings, upsertTlSettings } = require("../db");

const generateHomeView = async (team_id) => {
	let settings = await getTlSettings(team_id);
	if (!settings) {
		upsertTlSettings({ team_id });
		settings = await getTlSettings(team_id);
	}
	const {
		question,
		timeout,
		first_button_text,
		second_button_text,
		third_button_text,
		first_button_emoji,
		second_button_emoji,
		third_button_emoji,
		updated_at,
		updated_by,
	} = settings;
	return {
		type: "home",
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: "Traffic Light Bot Settings",
				},
			},
			{
				type: "divider",
			},
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "tl_question_input",
					initial_value: question,
				},
				label: {
					type: "plain_text",
					text: "Question to ask",
					emoji: true,
				},
				block_id: "tl_question_input_block",
			},
			{
				type: "input",
				element: {
					type: "static_select",
					placeholder: {
						type: "plain_text",
						text: "Select voting duration",
						emoji: true,
					},
					options: [
						{
							text: {
								type: "plain_text",
								text: "10 seconds",
								emoji: true,
							},
							value: "10",
						},
						{
							text: {
								type: "plain_text",
								text: "20 seconds",
								emoji: true,
							},
							value: "20",
						},
						{
							text: {
								type: "plain_text",
								text: "30 seconds",
								emoji: true,
							},
							value: "30",
						},
					],
					initial_option: {
						text: {
							type: "plain_text",
							text: `${timeout} seconds`,
							emoji: true,
						},
						value: timeout.toString(),
					},
					action_id: "tl_voting_duration_action",
				},
				label: {
					type: "plain_text",
					text: "Select voting duration",
					emoji: true,
				},
				block_id: "tl_voting_duration",
			},
			{
				type: "header",
				text: {
					type: "plain_text",
					text: "Answer buttons customization",
				},
			},
			{
				type: "divider",
			},
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "tl_buttons_input_1",
					initial_value: first_button_text,
				},
				label: {
					type: "plain_text",
					text: "First button text",
					emoji: true,
				},
				block_id: "tl_button_1_input",
			},
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "tl_buttons_emoji_1",
					initial_value: first_button_emoji,
				},
				label: {
					type: "plain_text",
					text: "First button emoji name",
					emoji: true,
				},
				block_id: "tl_button_1_emoji",
			},
			{
				type: "section",
				block_id: "tl_preview_block_1",
				text: {
					text: `Button preview:    *${first_button_text}* :${first_button_emoji}:`,
					type: "mrkdwn",
				},
				accessory: {
					type: "button",
					text: {
						type: "plain_text",
						text: "Update preview without saving",
						emoji: true,
					},
					value: "first_button_preview",
					action_id: "tl_update_preview_1",
				},
			},
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "tl_buttons_input_2",
					initial_value: second_button_text,
				},
				label: {
					type: "plain_text",
					text: "Second button text",
					emoji: true,
				},
				block_id: "tl_button_2_input",
			},
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "tl_buttons_emoji_2",
					initial_value: second_button_emoji,
				},
				label: {
					type: "plain_text",
					text: "Second button emoji name",
					emoji: true,
				},
				block_id: "tl_button_2_emoji",
			},
			{
				type: "section",
				block_id: "tl_preview_block_2",
				text: {
					text: `Button preview:    *${second_button_text}* :${second_button_emoji}:`,
					type: "mrkdwn",
				},
				accessory: {
					type: "button",
					text: {
						type: "plain_text",
						text: "Update preview without saving",
						emoji: true,
					},
					value: "second_button_preview",
					action_id: "tl_update_preview_2",
				},
			},
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "tl_buttons_input_3",
					initial_value: third_button_text,
				},
				label: {
					type: "plain_text",
					text: "Third button text",
					emoji: true,
				},
				block_id: "tl_button_3_input",
			},
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "tl_buttons_emoji_3",
					initial_value: third_button_emoji,
				},
				label: {
					type: "plain_text",
					text: "Third button emoji name",
					emoji: true,
				},
				block_id: "tl_button_3_emoji",
			},
			{
				type: "section",
				block_id: "tl_preview_block_3",
				text: {
					text: `Button preview:    *${third_button_text}* :${third_button_emoji}:`,
					type: "mrkdwn",
				},
				accessory: {
					type: "button",
					text: {
						type: "plain_text",
						text: "Update preview without saving",
						emoji: true,
					},
					value: "third_button_preview",
					action_id: "tl_update_preview_3",
				},
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Save settings",
							emoji: true,
						},
						style: "primary",
						value: "save_settings",
						action_id: "tl_save_settings",
					},
				],
			},
			{
				type: "context",
				elements: [
					{
						type: "plain_text",
						text: updated_by
							? `Updated by: ${updated_by} | Updated at: ${updated_at}`
							: "Not updated yet",
						emoji: true,
					},
				],
			},
		],
	};
};

module.exports = generateHomeView;
