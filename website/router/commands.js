const { parameters } = require("../extraFunctions")

module.exports = (client, website) => {
	const commandsRouter = (request, response) => {
		let object = parameters(client, request);

		object.subtitle = "Commands";
		object.defaultCategory = "Useful";

		response.view("commands", object)
	}

	return commandsRouter;
}