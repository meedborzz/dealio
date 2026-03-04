import React from 'react';
import { Lightbulb } from 'lucide-react';

interface SetupTipProps {
    text: string;
}

export const SetupTip: React.FC<SetupTipProps> = ({ text }) => {
    // Remove possible hardcoded emojis if they still exist in the string
    const cleanText = text.replace(/^[💡\s:]+/, '').replace(/^Bon à savoir\s*:\s*/i, '').replace(/^Good to know\s*:\s*/i, '').replace(/^جيد أن تعرف\s*:\s*/i, '');

    return (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    Astuce
                </p>
                <p className="text-xs text-foreground leading-relaxed">
                    {cleanText}
                </p>
            </div>
        </div>
    );
};
