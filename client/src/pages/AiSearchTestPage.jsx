import React, { useState } from 'react';
import { askAI } from '../api/aiApi';
import ReactMarkdown from 'react-markdown';

export default function AiSearchTestPage() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAsk = async (e) => {
        e.preventDefault();

        if (!question.trim()) return;

        setLoading(true);
        setError('');
        setAnswer('');

        try {
            const res = await askAI(question.trim());

            setAnswer(res.data.answer);
        } catch (err) {
            console.error(err);
            setError(
                'Something went wrong while getting the AI answer. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">

            <h1 className="text-2xl font-semibold mb-2">
                Intervjti AI
            </h1>

            <p className="text-gray-600 mb-6">
                Ask questions about interview experiences.
            </p>

            <form onSubmit={handleAsk} className="mb-6">

                <div className="flex gap-2">

                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g. What questions were asked in Morgan Stanley interviews?"
                        className="flex-1 border rounded px-3 py-2"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-5 py-2 rounded disabled:opacity-50"
                    >
                        {loading ? 'Thinking...' : 'Ask'}
                    </button>

                </div>

            </form>

            {error && (
                <div className="text-red-600 mb-4">
                    {error}
                </div>
            )}

            {answer && (
                <div className="border rounded-lg p-5">

                    <h2 className="font-semibold mb-3">
                        AI Answer
                    </h2>

                    <ReactMarkdown>
                        {answer}
                    </ReactMarkdown>

                </div>
            )}

            {!loading && !answer && !error && (
                <p className="text-gray-500">
                    Ask something about interview experiences to get started.
                </p>
            )}

        </div>
    );
}