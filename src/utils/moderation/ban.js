export default async (client, member, moderator, reason=null, msg = null, days = null) => {
	let container;

	if (msg)  container = msg;
	else      container = member;

	if (!container.guild) return "not guild";
	if (!container.guild.me.hasPermission('BAN_MEMBERS')) return "no perm";

	let user = member.user ? member.user : member;

	let logChannel = container.guild.config.render("logchan");
	let BanLogEmbed = client.util.embed()
		.setColor("#FF0000")
		.setThumbnail(container.guild.iconURL({format: 'png'}))
		.setDescription(reason)
		.setTimestamp(new Date())
		.addField(":cop: Moderator", `${moderator.user.tag} (#${moderator.id})`)
		.setFooter(`${user.tag} (#${user.id})`, user.displayAvatarURL({format: 'png'}));

	if (msg)
		BanLogEmbed.addField(":bookmark_tabs: Channel", `${msg.channel.name} (#${msg.channel.id})`);
	if (days)
		BanLogEmbed.addField(":wastebucket: Messages Pruned", days + " days worth");

	let error = false;
	if (msg && !msg.guild.members.has(user))
		await msg.guild.members.ban(user, {days: days, reason: reason});
	else {
		try {
			member.send(`You were banned from ${container.guild.name}: ${reason}`);
		} catch(e) {
			if (logChannel)
				BanLogEmbed.addField(":warning: No alert was sent", "Please notify him of his ban manually");
			else
				moderator.send("I couldn't alert him that he was banned. Please notify him manually").catch();
		}

		if (days)
			await member.ban({days: days, reason: reason}).catch((error) => { console.error(error); error = true;});
		else
			await member.ban(reason).catch((error) => { console.error(error); error = true;});
	}

	if (error)
		return "error when ban";

	if (logChannel && logChannel.sendable && logChannel.embedable)
		logChannel.send(`:skull_crossbones: ${user.tag} was banned`, {embed: BanLogEmbed});

	return true;
}