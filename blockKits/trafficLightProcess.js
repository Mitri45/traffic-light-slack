const fillContext = (image_url, name) => {
	return {
		type: "image",
		image_url,
		alt_text: name,
	};
};

const trafficLightProcess = (question, participants, revealFlag = false) => {
	const voted = [];
	const notVoted = [];
	const result = new Map();

	for(const [_, { name, image, vote }] of participants.entries()) {
		if(vote) {
			if(result.has(vote)) {
				const resultToUpdate = result.get(vote);
				resultToUpdate.elements.push(fillContext(image, name));
				result.set(vote, resultToUpdate)
			} else {
				result.set(vote, {
					type: "context",
					elements: [
						{
							type: "mrkdwn",
							text: `:${vote}: `
						},
						fillContext(image, name),
					],
				});
			}
			voted.push(fillContext(image, name));
		} else {
			notVoted.push(fillContext(image, name));
		}
	}
	let votedSection = [];
	let whoIsVotingSection;

	if(voted.length === 0) {
		votedSection = [{
			type: "context",
			elements: [
				{
					type: "mrkdwn",
					text: ":ghost:",
				},
			],
		}];
		whoIsVotingSection = {
			type: "context",
			elements: notVoted,
		};
	} else {
		votedSection = [{
			type: "context",
			elements: voted,
		}];
		whoIsVotingSection = {
			type: "context",
			elements: notVoted,
		};

	}

	const votingInProcessMessage = [
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
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "On track  :white_check_mark:",
						emoji: true,
					},
					value: "white_check_mark",
					action_id: "ap_vote_action_1",
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Concerned  :warning:",
						emoji: true,
					},
					value: "warning",
					action_id: "ap_vote_action_2",
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "No good  :no_entry:",
						emoji: true,
					},
					value: "no_entry",
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
							text: " Waiting response from: ",
							style: {
								bold: true,
							},
						},
					],
				},
			],
		},
		{
			...whoIsVotingSection,
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
							text: " Already responded:",
							style: {
								bold: true,
							},
						},
					],
				},
			],
		},
		...votedSection,
	];


	const votingFinishedMessage = [
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
		...result.values()
	];
	return (notVoted.length === 0 || revealFlag) ? votingFinishedMessage : votingInProcessMessage;
};

module.exports = { trafficLightProcess };
