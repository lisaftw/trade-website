import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder } from "discord.js"
import type { BotCommand } from "../lib/types.js"
import { sql } from "../lib/database.js"
import { generateChartUrl, generateAsciiChart } from "../lib/chart-generator.js"

export const analyticsCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("analytics")
    .setDescription("View comprehensive website analytics and statistics")
    .addStringOption((option) =>
      option
        .setName("timeframe")
        .setDescription("Select timeframe for analytics")
        .setRequired(false)
        .addChoices(
          { name: "Last 24 Hours", value: "24h" },
          { name: "Last 7 Days", value: "7d" },
          { name: "Last 30 Days", value: "30d" },
          { name: "All Time", value: "all" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Type of analytics to view")
        .setRequired(false)
        .addChoices(
          { name: "Overview", value: "overview" },
          { name: "Users", value: "users" },
          { name: "Trades", value: "trades" },
          { name: "Page Views", value: "pageviews" },
          { name: "Activity", value: "activity" },
        ),
    )
    .addBooleanOption((option) =>
      option
        .setName("charts")
        .setDescription("Include visual charts in the response")
        .setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()

    const timeframe = (interaction.options.getString("timeframe") || "7d") as "24h" | "7d" | "30d" | "all"
    const type = (interaction.options.getString("type") || "overview") as "overview" | "users" | "trades" | "pageviews" | "activity"
    const includeCharts = interaction.options.getBoolean("charts") || false

    try {
      let timeCondition = ""
      let timeLabel = "Last 7 Days"

      switch (timeframe) {
        case "24h":
          timeCondition = "WHERE created_at >= NOW() - INTERVAL '24 hours'"
          timeLabel = "Last 24 Hours"
          break
        case "7d":
          timeCondition = "WHERE created_at >= NOW() - INTERVAL '7 days'"
          timeLabel = "Last 7 Days"
          break
        case "30d":
          timeCondition = "WHERE created_at >= NOW() - INTERVAL '30 days'"
          timeLabel = "Last 30 Days"
          break
        case "all":
          timeCondition = ""
          timeLabel = "All Time"
          break
      }

      // OVERVIEW
      if (type === "overview") {
        const [totalUsers, totalTrades, totalItems, activeUsers, totalPageViews, totalActivities] = await Promise.all([
          sql`SELECT COUNT(*) as count FROM profiles`,
          sql`SELECT COUNT(*) as count FROM trades`,
          sql`SELECT COUNT(*) as count FROM items`,
          sql`SELECT COUNT(DISTINCT discord_id) as count FROM activities ${sql.unsafe(timeCondition)}`,
          sql`SELECT COUNT(*) as count FROM activities WHERE type = 'page_view' ${sql.unsafe(timeCondition.replace('WHERE', 'AND'))}`,
          sql`SELECT COUNT(*) as count FROM activities ${sql.unsafe(timeCondition)}`,
        ])

        const newUsers = await sql`SELECT COUNT(*) as count FROM profiles ${sql.unsafe(timeCondition)}`
        const newTrades = await sql`SELECT COUNT(*) as count FROM trades ${sql.unsafe(timeCondition)}`

        const embed = new EmbedBuilder()
          .setTitle(`📈 Website Analytics Overview`)
          .setDescription(`**${timeLabel}**`)
          .setColor(0x5865f2)
          .addFields(
            { name: "👥 Total Users", value: totalUsers[0].count.toString(), inline: true },
            { name: "✅ Active Users", value: activeUsers[0].count.toString(), inline: true },
            { name: "🆕 New Users", value: newUsers[0].count.toString(), inline: true },
            { name: "🔄 Total Trades", value: totalTrades[0].count.toString(), inline: true },
            { name: "📝 New Trades", value: newTrades[0].count.toString(), inline: true },
            { name: "🎮 Total Items", value: totalItems[0].count.toString(), inline: true },
            { name: "👁️ Page Views", value: totalPageViews[0].count.toString(), inline: true },
            { name: "⚡ Total Activities", value: totalActivities[0].count.toString(), inline: true },
          )
          .setFooter({ text: "Use /analytics with options for detailed stats" })
          .setTimestamp()

        await interaction.editReply({ embeds: [embed] })
        return
      }

      // USERS
      if (type === "users") {
        const [totalUsers, activeUsers, newUsers] = await Promise.all([
          sql`SELECT COUNT(*) as count FROM profiles`,
          sql`SELECT COUNT(DISTINCT discord_id) as count FROM activities ${sql.unsafe(timeCondition)}`,
          sql`SELECT COUNT(*) as count FROM profiles ${sql.unsafe(timeCondition)}`,
        ])

        const recentLogins = await sql`SELECT COUNT(*) as count FROM activities WHERE type = 'login' ${sql.unsafe(timeCondition.replace('WHERE', 'AND'))}`
        
        // Get top 5 most active users
        const topUsers = await sql`
          SELECT 
            p.username,
            p.global_name,
            COUNT(*) as activity_count
          FROM activities a
          JOIN profiles p ON a.discord_id = p.discord_id
          ${sql.unsafe(timeCondition)}
          GROUP BY p.discord_id, p.username, p.global_name
          ORDER BY activity_count DESC
          LIMIT 5
        `

        // Get daily signups for chart
        const dailySignups = await sql`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
          FROM profiles
          ${sql.unsafe(timeCondition)}
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 7
        `

        let topUsersText = topUsers.map((u, i) => 
          `${i + 1}. **${u.global_name || u.username}** - ${u.activity_count} activities`
        ).join('\n') || 'No activity yet'

        const embed = new EmbedBuilder()
          .setTitle(`👥 User Analytics - ${timeLabel}`)
          .setColor(0x57f287)
          .addFields(
            { name: "📊 Statistics", value: `Total Users: **${totalUsers[0].count}**\nActive Users: **${activeUsers[0].count}**\nNew Users: **${newUsers[0].count}**\nTotal Logins: **${recentLogins[0].count}**`, inline: false },
            { name: "🏆 Most Active Users", value: topUsersText, inline: false },
          )
          .setTimestamp()

        if (includeCharts && dailySignups.length > 0) {
          const chartData = {
            labels: dailySignups.reverse().map(d => new Date(d.date).toLocaleDateString()),
            datasets: [{
              label: 'New Users',
              data: dailySignups.map(d => Number(d.count)),
              backgroundColor: 'rgba(87, 242, 135, 0.5)',
              borderColor: 'rgba(87, 242, 135, 1)',
            }],
          }
          const chartUrl = generateChartUrl('line', chartData, 'New User Signups')
          embed.setImage(chartUrl)
        } else {
          // ASCII chart
          const chartData = dailySignups.reverse().map(d => Number(d.count))
          const labels = dailySignups.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
          if (chartData.length > 0) {
            embed.addFields({ name: "📈 Daily Signups", value: generateAsciiChart(chartData, labels), inline: false })
          }
        }

        await interaction.editReply({ embeds: [embed] })
        return
      }

      // TRADES
      if (type === "trades") {
        const [totalTrades, activeTrades, completedTrades, cancelledTrades] = await Promise.all([
          sql`SELECT COUNT(*) as count FROM trades ${sql.unsafe(timeCondition)}`,
          sql`SELECT COUNT(*) as count FROM trades WHERE status = 'active' ${sql.unsafe(timeCondition.replace('WHERE', 'AND'))}`,
          sql`SELECT COUNT(*) as count FROM trades WHERE status = 'completed' ${sql.unsafe(timeCondition.replace('WHERE', 'AND'))}`,
          sql`SELECT COUNT(*) as count FROM trades WHERE status = 'cancelled' ${sql.unsafe(timeCondition.replace('WHERE', 'AND'))}`,
        ])

        // Get trades by game
        const tradesByGame = await sql`
          SELECT 
            game,
            COUNT(*) as count
          FROM trades
          ${sql.unsafe(timeCondition)}
          GROUP BY game
          ORDER BY count DESC
        `

        // Get daily trade creation
        const dailyTrades = await sql`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
          FROM trades
          ${sql.unsafe(timeCondition)}
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 7
        `

        let gameBreakdown = tradesByGame.map(g => 
          `**${g.game}**: ${g.count} trades`
        ).join('\n') || 'No trades yet'

        const embed = new EmbedBuilder()
          .setTitle(`🔄 Trade Analytics - ${timeLabel}`)
          .setColor(0xfee75c)
          .addFields(
            { name: "📊 Trade Statistics", value: `Total Trades: **${totalTrades[0].count}**\nActive: **${activeTrades[0].count}**\nCompleted: **${completedTrades[0].count}**\nCancelled: **${cancelledTrades[0].count}**`, inline: false },
            { name: "🎮 Trades by Game", value: gameBreakdown, inline: false },
          )
          .setTimestamp()

        if (includeCharts && dailyTrades.length > 0) {
          const chartData = {
            labels: dailyTrades.reverse().map(d => new Date(d.date).toLocaleDateString()),
            datasets: [{
              label: 'New Trades',
              data: dailyTrades.map(d => Number(d.count)),
              backgroundColor: 'rgba(254, 231, 92, 0.5)',
              borderColor: 'rgba(254, 231, 92, 1)',
            }],
          }
          const chartUrl = generateChartUrl('bar', chartData, 'Daily Trade Creation')
          embed.setImage(chartUrl)
        } else {
          // ASCII chart
          const chartData = dailyTrades.reverse().map(d => Number(d.count))
          const labels = dailyTrades.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
          if (chartData.length > 0) {
            embed.addFields({ name: "📈 Daily Trades", value: generateAsciiChart(chartData, labels), inline: false })
          }
        }

        await interaction.editReply({ embeds: [embed] })
        return
      }

      // PAGE VIEWS
      if (type === "pageviews") {
        const totalPageViews = await sql`
          SELECT COUNT(*) as count 
          FROM activities 
          WHERE type = 'page_view' 
          ${sql.unsafe(timeCondition.replace('WHERE', 'AND'))}
        `

        const uniqueVisitors = await sql`
          SELECT COUNT(DISTINCT discord_id) as count 
          FROM activities 
          WHERE type = 'page_view' 
          ${sql.unsafe(timeCondition.replace('WHERE', 'AND'))}
        `

        // Most visited pages
        const topPages = await sql`
          SELECT 
            meta->>'page' as page,
            COUNT(*) as views
          FROM activities
          WHERE type = 'page_view' 
          ${sql.unsafe(timeCondition.replace('WHERE', 'AND'))}
          AND meta->>'page' IS NOT NULL
          GROUP BY meta->>'page'
          ORDER BY views DESC
          LIMIT 10
        `

        // Daily page views
        const dailyViews = await sql`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
          FROM activities
          WHERE type = 'page_view'
          ${sql.unsafe(timeCondition.replace('WHERE', 'AND'))}
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 7
        `

        let topPagesText = topPages.map((p, i) => 
          `${i + 1}. **${p.page}** - ${p.views} views`
        ).join('\n') || 'No page views tracked yet'

        const embed = new EmbedBuilder()
          .setTitle(`👁️ Page View Analytics - ${timeLabel}`)
          .setColor(0xeb459e)
          .addFields(
            { name: "📊 View Statistics", value: `Total Page Views: **${totalPageViews[0].count}**\nUnique Visitors: **${uniqueVisitors[0].count}**\nAvg Views/Visitor: **${Math.round(Number(totalPageViews[0].count) / Number(uniqueVisitors[0].count) || 0)}**`, inline: false },
            { name: "🔥 Most Visited Pages", value: topPagesText, inline: false },
          )
          .setTimestamp()

        if (includeCharts && dailyViews.length > 0) {
          const chartData = {
            labels: dailyViews.reverse().map(d => new Date(d.date).toLocaleDateString()),
            datasets: [{
              label: 'Page Views',
              data: dailyViews.map(d => Number(d.count)),
              backgroundColor: 'rgba(235, 69, 158, 0.5)',
              borderColor: 'rgba(235, 69, 158, 1)',
            }],
          }
          const chartUrl = generateChartUrl('line', chartData, 'Daily Page Views')
          embed.setImage(chartUrl)
        } else {
          // ASCII chart
          const chartData = dailyViews.reverse().map(d => Number(d.count))
          const labels = dailyViews.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
          if (chartData.length > 0) {
            embed.addFields({ name: "📈 Daily Page Views", value: generateAsciiChart(chartData, labels), inline: false })
          }
        }

        await interaction.editReply({ embeds: [embed] })
        return
      }

      // ACTIVITY
      if (type === "activity") {
        const totalActivities = await sql`
          SELECT COUNT(*) as count 
          FROM activities 
          ${sql.unsafe(timeCondition)}
        `

        // Activity breakdown by type
        const activityTypes = await sql`
          SELECT 
            type,
            COUNT(*) as count
          FROM activities
          ${sql.unsafe(timeCondition)}
          GROUP BY type
          ORDER BY count DESC
          LIMIT 10
        `

        // Hourly activity distribution (for 24h timeframe)
        let hourlyActivity = null
        if (timeframe === '24h') {
          hourlyActivity = await sql`
            SELECT 
              EXTRACT(HOUR FROM created_at) as hour,
              COUNT(*) as count
            FROM activities
            WHERE created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY EXTRACT(HOUR FROM created_at)
            ORDER BY hour
          `
        }

        let activityBreakdown = activityTypes.map((a, i) => 
          `${i + 1}. **${a.type}** - ${a.count} events`
        ).join('\n') || 'No activity yet'

        const embed = new EmbedBuilder()
          .setTitle(`⚡ Activity Analytics - ${timeLabel}`)
          .setColor(0x5865f2)
          .addFields(
            { name: "📊 Total Activities", value: `**${totalActivities[0].count}** events recorded`, inline: false },
            { name: "📋 Activity Breakdown", value: activityBreakdown, inline: false },
          )
          .setTimestamp()

        if (hourlyActivity && hourlyActivity.length > 0) {
          const chartData = hourlyActivity.map(h => Number(h.count))
          const labels = hourlyActivity.map(h => `${h.hour}:00`)
          embed.addFields({ name: "⏰ Hourly Distribution (24h)", value: generateAsciiChart(chartData, labels, 15), inline: false })
        }

        await interaction.editReply({ embeds: [embed] })
        return
      }

    } catch (error) {
      console.error("Analytics command error:", error)
      await interaction.editReply({
        content: `❌ Failed to fetch analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  },
}
