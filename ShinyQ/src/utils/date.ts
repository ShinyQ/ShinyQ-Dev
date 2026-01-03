export function formatDate(date: string): string {
  if (date === "Present") return "Present";
  
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
} 