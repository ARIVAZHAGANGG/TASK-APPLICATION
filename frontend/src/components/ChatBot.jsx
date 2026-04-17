import { useEffect } from 'react';

const ChatBot = () => {
    useEffect(() => {
        // Only inject if it doesn't exist already
        if (!document.getElementById('noupe-chatbot-script')) {
            const script = document.createElement('script');
            script.id = 'noupe-chatbot-script';
            script.src = 'https://www.noupe.com/embed/019d57b868357fe396f1a3fbd3a0b6bebb02.js';
            script.async = true;
            document.body.appendChild(script);
        }

        return () => {
            // Optional: clean up the script or chatbot widget if the user logs out
            // For now, we will just keep the script loaded but hide the widget if needed.
            // Or remove the script. Removing the script might not remove the injected HTML.
            // But since this is a SPA, logging out redirects to /login.
            // A full reload usually happens, or we can just hide it.
            // Usually, these widgets inject an iframe or a div. We might need to remove them on unmount.
            // For now, let's try to remove the script itself.
            const script = document.getElementById('noupe-chatbot-script');
            if (script) {
                script.remove();
            }
            // Some widgets create a div with a specific ID, let's leave that for now.
        };
    }, []);

    return null;
};

export default ChatBot;
