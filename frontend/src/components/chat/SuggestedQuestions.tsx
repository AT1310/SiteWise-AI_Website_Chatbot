import { HiLightBulb } from "react-icons/hi2";

interface Props {
  hostname: string;
  onPick: (q: string) => void;
}

export function SuggestedQuestions({ hostname, onPick }: Props) {
  const questions = [
    `What is ${hostname} about?`,
    `Give me a 3-bullet summary.`,
    `Show a quick-start example.`,
    `What are the key concepts?`,
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <HiLightBulb /> Suggested
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            className="glass rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/10"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
