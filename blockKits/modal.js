const modal = (users, tlQuestion = "") => {
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
					type: "multi_users_select",
					placeholder: {
						type: "plain_text",
						text: "Select participants",
						emoji: true,
					},
					action_id: "pa_input_participants_action",
					initial_users: users,
				},
				label: {
					type: "plain_text",
					text: "Select Participants",
					emoji: true,
				},
				block_id: "pa_input_participants",
			},
		],
		callback_id: "tl-start-session-modal",
	};
};

module.exports = { modal };
