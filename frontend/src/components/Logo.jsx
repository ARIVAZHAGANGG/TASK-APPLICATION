import React from "react";

const Logo = ({ className }) => {
    return (
        <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect width="32" height="32" rx="10" fill="url(#paint0_linear)" />
            <path
                d="M22 13.5C22 13.5 22.5 11 20.5 11C18.5 11 16 12 16 12C16 12 13.5 11 11.5 11C9.5 11 10 13.5 10 13.5V19.5C10 19.5 9 22.5 12 22.5H20C23 22.5 22 19.5 22 19.5V13.5Z"
                fill="white"
            />
            <circle cx="13.5" cy="16.5" r="1.5" fill="#4F46E5" />
            <circle cx="18.5" cy="16.5" r="1.5" fill="#4F46E5" />
            <path
                d="M14.5 20C14.5 20 15 20.5 16 20.5C17 20.5 17.5 20 17.5 20"
                stroke="#4F46E5"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <defs>
                <linearGradient
                    id="paint0_linear"
                    x1="0"
                    y1="0"
                    x2="32"
                    y2="32"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#4F46E5" />
                    <stop offset="1" stopColor="#7C3AED" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export default React.memo(Logo);
