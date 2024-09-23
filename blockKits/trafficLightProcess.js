const fillContext = (image_url, name) => {
	return {
		type: "image",
		image_url,
		alt_text: name,
	};
};
let result = new Map();
let votedSection = [
	{
		type: "context",
		elements: [],
	},
];
let voted = [];

const trafficLightProcess = (options) => {
	const {
		question,
		timeout,
		revealFlag,
		startSession,
		participant,
		first_button_text,
		second_button_text,
		third_button_text,
		first_button_emoji,
		second_button_emoji,
		third_button_emoji,
	} = options;

	const votingInProcess = [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "\n",
			},
		},
		{
			type: "header",
			text: {
				type: "plain_text",
				text: question,
				emoji: true,
			},
		},
		{
			type: "context",
			elements: [
				{
					type: "mrkdwn",
					text: `:hourglass_flowing_sand: votes will be reveled in ${timeout} seconds`,
				},
			],
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: `${first_button_text} ${first_button_emoji}`,
						emoji: true,
					},
					value: first_button_emoji,
					action_id: "ap_vote_action_1",
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						text: `${second_button_text} ${second_button_emoji}`,
						emoji: true,
					},
					value: second_button_emoji,
					action_id: "ap_vote_action_2",
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						text: `${third_button_text} ${third_button_emoji}`,
						emoji: true,
					},
					value: third_button_emoji,
					action_id: "ap_vote_action_3",
				},
			],
			block_id: "tl-vote-block",
		},
		{
			type: "divider",
		},
		{
			type: "rich_text",
			elements: [
				{
					type: "rich_text_section",
					elements: [
						{
							type: "text",
							text: "Who's voted already:",
							style: {
								bold: true,
							},
						},
					],
				},
			],
		},
	];

	if (startSession) {
		result = new Map();
		voted = [];
		votedSection = [
			{
				type: "context",
				elements: [],
			},
		];
		return [
			...votingInProcess,
			{
				type: "context",
				elements: [
					{
						type: "mrkdwn",
						text: ":ghost:",
					},
				],
			},
		];
	}

	if (participant?.vote) {
		const { name, image, vote, id } = participant;
		if (voted.includes(id)) {
			// User has already voted, update their vote
			for (const [key, value] of result.entries()) {
				const index = value.elements.findIndex((el) => el.alt_text === name);
				if (index !== -1) {
					// Remove user from previous vote
					value.elements.splice(index, 1);
					if (value.elements.length === 1) {
						// Only the emoji is left, remove this entry
						result.delete(key);
					}
					break;
				}
			}
		}

		// Add or update user's vote
		if (result.has(vote)) {
			const resultToUpdate = result.get(vote);
			resultToUpdate.elements.push(fillContext(image, name));
			result.set(vote, resultToUpdate);
		} else {
			result.set(vote, {
				type: "context",
				elements: [
					{
						type: "mrkdwn",
						text: vote,
					},
					fillContext(image, name),
				],
			});
		}

		if (!voted.includes(id)) {
			voted.push(id);
			votedSection[0].elements.push(fillContext(image, name));
		}
	}

	const showResultsButton = [
		{
			type: "divider",
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Reveal results now :alarm_clock:",
						emoji: true,
					},
					action_id: "revealResults_action",
				},
			],
			block_id: "tl-show_results",
		},
	];

	const votingInProcessMessage = [
		...votingInProcess,
		...votedSection,
		...showResultsButton,
	];

	if (revealFlag) {
		return [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "\n",
				},
			},
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "\n",
				},
			},
			{
				type: "header",
				text: {
					type: "plain_text",
					text: "Team's vibe: ",
					emoji: true,
				},
			},
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "\n",
				},
			},
			...result.values(),
		];
	}
	return votingInProcessMessage;
};

module.exports = trafficLightProcess;
