import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface YesNoInputProps {
    value?: boolean;
    onChange?: (value: boolean) => void;
    yesLabel?: string;
    noLabel?: string;
}

export function YesNoInput({
                               value,
                               onChange,
                               yesLabel = "نعم",
                               noLabel = "لا",
                           }: YesNoInputProps) {
    // const [selectedValue, setSelectedValue] = useState<boolean | undefined>(value);
    //
    // const handleSelect = (choice: boolean) => {
    //     setSelectedValue(choice);
    //     onChange?.(choice);
    // };

    return (
        <div className="flex items-center justify-center gap-8">
            <button
                type="button"
                onClick={() => onChange?.(true)}
                className="flex flex-col items-center gap-3 group"
            >
                <div
                    className={`
            w-14 h-14 rounded-full transition-all duration-200
            flex items-center justify-center
            ${
                        value === true
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg scale-105'
                            : 'bg-gray-100 hover:bg-gray-200'
                    }
          `}
                >
                    <ThumbsUp
                        className={`
              w-7 h-7 transition-colors duration-200
              ${
                            value === true
                                ? 'text-white'
                                : 'text-gray-600 group-hover:text-gray-700'
                        }
            `}
                    />
                </div>
                <span
                    className={`
            transition-colors duration-200
            ${
                        value === true
                            ? 'text-blue-600'
                            : 'text-gray-600'
                    }
          `}
                >
          {yesLabel}
        </span>
            </button>

            <button
                type="button"
                onClick={() => onChange?.(false)}
                className="flex flex-col items-center gap-3 group"
            >
                <div
                    //w24 h-24
                    className={`
            w-14 h-14 rounded-full transition-all duration-200
            flex items-center justify-center
            ${
                        value === false
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg scale-105'
                            : 'bg-gray-100 hover:bg-gray-200'
                    }
          `}
                >
                    <ThumbsDown
                        //w-10 h-10
                        className={`
              w-7 h-7 transition-colors duration-200
              ${
                            value === false
                                ? 'text-white'
                                : 'text-gray-600 group-hover:text-gray-700'
                        }
            `}
                    />
                </div>
                <span
                    className={`
            transition-colors duration-200
            ${
                        value === false
                            ? 'text-blue-600'
                            : 'text-gray-600'
                    }
          `}
                >
          {noLabel}
        </span>
            </button>
        </div>
    );
}
