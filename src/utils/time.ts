export function toRelativeTime(iso: string): string {
  const created = new Date(iso).getTime();
  if (Number.isNaN(created)) return "";

  const diffMs = Date.now() - created;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "\u0442\u043e\u043b\u044c\u043a\u043e \u0447\u0442\u043e";
  if (diffMin < 60) return `${diffMin} \u043c\u0438\u043d \u043d\u0430\u0437\u0430\u0434`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} \u0447 \u043d\u0430\u0437\u0430\u0434`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} \u0434 \u043d\u0430\u0437\u0430\u0434`;
}
