const modal = (tlQuestion = "") => {
	return {
		type: "modal",
		title: {
			type: "plain_text",
			text: "Traffic Light",
			emoji: true,
		},
		submit: {
			type: "plain_text",
			text: "Feel the vibe",
			emoji: true,
		},
		close: {
			type: "plain_text",
			text: "Cancel",
			emoji: true,
		},
		blocks: [
			{
				type: "divider",
			},
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "tl_question_input",
					initial_value: tlQuestion,
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
							value: "10"
						},
						{
							text: {
								type: "plain_text",
								text: "20 seconds",
								emoji: true,
							},
							value: "20"
						},
						{
							text: {
								type: "plain_text",
								text: "30 seconds",
								emoji: true,
							},
							value: "30"
						}
					],
					initial_option: {
						text: {
							type: "plain_text",
							text: "10 seconds",
							emoji: true,
						},
						value: "10"
					},
					action_id: "tl_voting_duration_action"
				},
				label: {
					type: "plain_text",
					text: "Select voting duration",
					emoji: true,
				},
				block_id: "tl_voting_duration",
			},
		],
		callback_id: "tl-start-session-modal",
	};
};

module.exports = { modal };
