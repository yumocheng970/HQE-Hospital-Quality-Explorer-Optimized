import { useState } from 'react';

export default function QueryBar({ onSearch }) {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        onSearch(trimmed);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div className="flex gap-4">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Try: "hospitals in CA with 5 stars"'
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-lg transition-colors"
            >
                Search
            </button>
        </div>
    );
}