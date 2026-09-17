import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
const RULES_INTRO = 'يرجى من جميع الأعضاء الالتزام بالقوانين التالية للحفاظ على بيئة إيجابية للجميع.';
const RULES_FIELDS = [
    {
        header: '01・الاحترام 🤝 | Respect',
        description: [
            'يجب احترام جميع الأعضاء والإدارة. يمنع السب، الإهانة، التنمر، الاستفزاز، العنصرية، وخطاب الكراهية.',
            'All members and staff must be respected. Insults, harassment, bullying, provocation, racism, and hate speech are strictly prohibited.',
        ].join('\n'),
    },
    {
        header: '02・السبام 🚫 | Spam',
        description: [
            'يمنع إرسال الرسائل المتكررة، المنشن المتكرر، الإيموجيات بشكل مزعج، أو استخدام الأوامر بطريقة مزعجة.',
            'Do not spam messages, mentions, emojis, or bot commands.',
        ].join('\n'),
    },
    {
        header: '03・الإعلانات 📢 | Advertising',
        description: [
            'يمنع الإعلان عن سيرفرات أو قنوات أو حسابات أو خدمات أخرى بدون إذن الإدارة.',
            'Advertising other servers, channels, accounts, or services without staff permission is prohibited.',
        ].join('\n'),
    },
    {
        header: '04・المحتوى غير المناسب 🔞 | Inappropriate Content',
        description: [
            'يمنع نشر المحتوى الإباحي، العنصري، الدموي، أو أي محتوى غير مناسب.',
            'NSFW, racist, excessively graphic, or otherwise inappropriate content is not allowed.',
        ].join('\n'),
    },
    {
        header: '05・الروابط والاحتيال 🔗 | Links & Scams',
        description: [
            'يمنع نشر الروابط المشبوهة، روابط التصيد، الملفات الضارة، أو أي محتوى يهدف إلى سرقة الحسابات أو المعلومات الشخصية.',
            'Do not share suspicious links, phishing links, malicious files, or content intended to steal accounts or personal information.',
        ].join('\n'),
    },
    {
        header: '06・المنشن 📣 | Mentions',
        description: [
            'يمنع استخدام @everyone أو @here أو منشن الإدارة بشكل غير ضروري.',
            'Do not abuse @everyone, @here, or staff mentions.',
        ].join('\n'),
    },
    {
        header: '07・استخدام الروم الصحيح 📂 | Use The Correct Channel',
        description: [
            'يجب استخدام كل روم للغرض المخصص له وعدم نشر محتوى غير متعلق بالروم.',
            'Use each channel for its intended purpose and keep conversations relevant.',
        ].join('\n'),
    },
    {
        header: '08・الخصوصية 🔒 | Privacy',
        description: [
            'يمنع نشر معلوماتك الشخصية أو معلومات أي شخص آخر بدون إذن.',
            "Never share your personal information or someone else's private information without permission.",
        ].join('\n'),
    },
    {
        header: '09・الرومات الصوتية 🎙️ | Voice Channels',
        description: [
            'يمنع الصراخ المتعمد، تشغيل الأصوات المزعجة، إزعاج الآخرين، أو إساءة استخدام المايك.',
            'Do not intentionally scream, play disturbing sounds, harass others, or abuse your microphone.',
        ].join('\n'),
    },
    {
        header: '10・البث 🔴 | Streaming',
        description: [
            'يمنع التشويش على البث، حرق الأحداث، إزعاج الستريمر، أو الترويج لبثك أو قناتك بدون إذن.',
            'Do not disrupt the stream, spoil games or events, harass the streamer, or promote your own streams or channels without permission.',
        ].join('\n'),
    },
    {
        header: '11・المشاكل والدراما ⚠️ | Drama & Conflicts',
        description: [
            'يمنع افتعال المشاكل أو نشر الفتن أو محاولة إثارة الأعضاء ضد بعضهم.',
            'Do not start unnecessary drama, arguments, or conflicts between members.',
        ].join('\n'),
    },
    {
        header: '12・قرارات الإدارة 🛡️ | Staff Decisions',
        description: [
            'يجب احترام قرارات الإدارة. في حال وجود اعتراض، تواصل مع الإدارة باحترام.',
            'Staff decisions must be respected. If you disagree with a decision, contact the staff and discuss it respectfully.',
        ].join('\n'),
    },
    {
        header: '13・العقوبات ⚔️ | Punishments',
        description: [
            'قد تشمل العقوبات التحذير، الميوت، الطرد، الحظر المؤقت، أو الحظر الدائم حسب خطورة المخالفة.',
            'Punishments may include warnings, timeout, kick, temporary ban, or permanent ban depending on the severity of the violation.',
        ].join('\n'),
    },
];
const IMPORTANT_NOTE = {
    header: '⚠️ ملاحظة هامة | Important Note',
    description: [
        'المخالفات الخطيرة قد تؤدي إلى حظر مباشر بدون تحذير.',
        'Serious violations may result in an immediate ban without warning.',
    ].join('\n'),
};
/** Builds the finalized rules embed for /rules. */
function buildRulesEmbed() {
    return new EmbedBuilder()
        .setColor(0xf2c14e)
        .setTitle('📜 قوانين السيرفر | Server Rules')
        .setDescription(RULES_INTRO)
        .addFields(...[...RULES_FIELDS, IMPORTANT_NOTE].map((rule) => ({
        name: `**${rule.header}**`,
        value: rule.description,
        inline: false,
    })))
        .setFooter({ text: 'Thank you for being part of our community.' });
}
const rulesCommand = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Posts the server rules to this channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute({ interaction }) {
        await interaction.reply({ embeds: [buildRulesEmbed()] });
    },
};
export default rulesCommand;
