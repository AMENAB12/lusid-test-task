import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormulaStore } from '@/lib/formulaStore';
import { CheckIcon, ChevronDownIcon, PencilIcon, XIcon, TrendingUpIcon, TableIcon, FunctionIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type Variable = {
    id: string;
    name: string;
    category: string;
    value: number | string;
};

const OPERATORS = ['+', '-', '*', '/', '^', '(', ')'];

const FormulaInput: React.FC = () => {
    const {
        formula = [],
        addVariable,
        removeVariable,
        replaceVariable,
        calculateResult
    } = useFormulaStore();

    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [result, setResult] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('formula');
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
    const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    // Fetch suggestions from API
    const { data: suggestions = [] } = useQuery<Variable[]>({
        queryKey: ['variableSuggestions', inputValue],
        queryFn: async () => {
            const response = await fetch('https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: inputValue.length > 0 && !OPERATORS.includes(inputValue),
    });

    // Filter suggestions based on input and category
    const filteredSuggestions = suggestions.filter(item =>
        item.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (e.target.value) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace to delete tags
        if (e.key === 'Backspace' && inputValue === '' && formula.length > 0) {
            e.preventDefault();
            removeVariable(formula.length - 1);
        }

        // Handle operators directly
        if (OPERATORS.includes(e.key)) {
            e.preventDefault();
            if (inputValue) {
                // Try to parse as number first
                const numValue = parseFloat(inputValue);

                // Add current input as a variable if there's text
                addVariable({
                    id: Date.now().toString(),
                    name: inputValue,
                    category: isNaN(numValue) ? 'custom' : 'number',
                    value: isNaN(numValue) ? 0 : numValue
                });
                setInputValue('');
            }

            // Add the operator as a variable
            addVariable({
                id: Date.now().toString(),
                name: e.key,
                category: 'operator',
                value: e.key
            });
        }

        // Handle Enter to add current input as a variable
        if (e.key === 'Enter' && inputValue) {
            e.preventDefault();

            // If we have suggestions and input matches partially, use first suggestion
            if (filteredSuggestions.length > 0 && showSuggestions) {
                handleSelectSuggestion(filteredSuggestions[0]);
            } else {
                // Try to parse as number first
                const numValue = parseFloat(inputValue);

                addVariable({
                    id: Date.now().toString(),
                    name: inputValue,
                    category: isNaN(numValue) ? 'custom' : 'number',
                    value: isNaN(numValue) ? 0 : numValue
                });
            }

            setInputValue('');
            setShowSuggestions(false);
        }

        // Handle Tab to select suggestion
        if (e.key === 'Tab' && showSuggestions && filteredSuggestions.length > 0) {
            e.preventDefault();
            handleSelectSuggestion(filteredSuggestions[0]);
        }

        // Handle equal sign to calculate
        if (e.key === '=' || e.key === 'Enter' && inputValue === '') {
            e.preventDefault();
            evaluateFormula();
        }
    };

    const handleSelectSuggestion = (suggestion: Variable) => {
        addVariable(suggestion);
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleReplaceVariable = (index: number, variable: Variable) => {
        replaceVariable(index, variable);
        setSelectedTagIndex(null);
    };

    const handleTagClick = (index: number) => {
        // If we're already editing a different tag, finish that edit first
        if (editingTagIndex !== null && editingTagIndex !== index) {
            finishEditing();
        }

        setSelectedTagIndex(index === selectedTagIndex ? null : index);
    };

    const startEditing = (index: number) => {
        const variable = formula[index];
        if (variable.category !== 'operator') {
            setEditingTagIndex(index);
            setEditingValue(variable.name);
            // Set a small timeout to ensure the DOM element is available
            setTimeout(() => {
                editInputRef.current?.focus();
                editInputRef.current?.select();
            }, 10);
        }
    };

    const handleEditingKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishEditing();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEditing();
        }
    };

    const finishEditing = () => {
        if (editingTagIndex !== null) {
            const numValue = parseFloat(editingValue);
            replaceVariable(editingTagIndex, {
                ...formula[editingTagIndex],
                name: editingValue,
                category: isNaN(numValue) ? 'custom' : 'number',
                value: isNaN(numValue) ? 0 : numValue
            });
            setEditingTagIndex(null);
            setEditingValue('');
            inputRef.current?.focus();
        }
    };

    const cancelEditing = () => {
        setEditingTagIndex(null);
        setEditingValue('');
        inputRef.current?.focus();
    };

    const evaluateFormula = () => {
        // If there's text in the input, add it first
        if (inputValue) {
            const numValue = parseFloat(inputValue);
            addVariable({
                id: Date.now().toString(),
                name: inputValue,
                category: isNaN(numValue) ? 'custom' : 'number',
                value: isNaN(numValue) ? 0 : numValue
            });
            setInputValue('');
        }

        const result = calculateResult();
        setResult(result);
    };

    const handleRemoveVariable = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering other click handlers
        removeVariable(index);
    };

    useEffect(() => {
        // Keep focus on input unless we're editing a tag
        if (editingTagIndex === null) {
            inputRef.current?.focus();
        }
    }, [formula, editingTagIndex]);

    // Click outside handler to finish editing
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (editingTagIndex !== null &&
                editInputRef.current &&
                !editInputRef.current.contains(e.target as Node)) {
                finishEditing();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingTagIndex, editingValue]);

    return (
        <div className="w-full space-y-4">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <Tabs defaultValue="formula" className="w-auto" onValueChange={(value) => setActiveTab(value)}>
                    <TabsList className="bg-gray-100">
                        <TabsTrigger value="formula" className="flex items-center gap-2">
                            <FunctionIcon className="h-4 w-4" />
                            Formula
                        </TabsTrigger>
                        <TabsTrigger value="trend" className="flex items-center gap-2">
                            <TrendingUpIcon className="h-4 w-4" />
                            Trend
                        </TabsTrigger>
                        <TabsTrigger value="data" className="flex items-center gap-2">
                            <TableIcon className="h-4 w-4" />
                            Data
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Formula Input Area */}
            <div className="relative">
                <div className={cn(
                    "flex items-center border-2 rounded-lg p-3 bg-white min-h-12",
                    "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500",
                    "shadow-sm hover:border-gray-400 transition-colors"
                )}>
                    <div className="flex flex-wrap gap-1.5 items-center flex-grow">
                        {Array.isArray(formula) && formula.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="relative">
                                {item.category === 'operator' ? (
                                    <span className="mx-1 text-gray-700 font-medium">{item.name}</span>
                                ) : editingTagIndex === index ? (
                                    <div className="flex items-center px-2 py-1.5 rounded-md bg-blue-50 border-2 border-blue-300">
                                        <input
                                            ref={editInputRef}
                                            type="text"
                                            className="outline-none bg-transparent w-full"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            onKeyDown={handleEditingKeyDown}
                                            onBlur={finishEditing}
                                        />
                                        <button
                                            className="ml-1.5 text-blue-600 hover:text-blue-800"
                                            onClick={finishEditing}
                                        >
                                            <CheckIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div
                                                className={cn(
                                                    "px-2 py-1.5 rounded-md text-sm flex items-center gap-1.5 cursor-pointer",
                                                    "transition-all duration-200",
                                                    item.category === 'number'
                                                        ? 'bg-gray-100 hover:bg-gray-200'
                                                        : 'bg-blue-50 hover:bg-blue-100',
                                                    selectedTagIndex === index && 'ring-2 ring-blue-300',
                                                    "group"
                                                )}
                                                onClick={() => handleTagClick(index)}
                                            >
                                                {item.name}
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="text-gray-500 hover:text-gray-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startEditing(index);
                                                        }}
                                                    >
                                                        <PencilIcon className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        className="ml-1 text-gray-500 hover:text-red-500"
                                                        onClick={(e) => handleRemoveVariable(index, e)}
                                                    >
                                                        <XIcon className="h-3.5 w-3.5" />
                                                    </button>
                                                    <ChevronDownIcon className="h-3.5 w-3.5 ml-1" />
                                                </div>
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-64">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(index);
                                                }}
                                            >
                                                <div className="flex items-center text-sm">
                                                    <PencilIcon className="h-3.5 w-3.5 mr-2" />
                                                    Edit
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => handleRemoveVariable(index, e)}
                                                className="text-red-500"
                                            >
                                                <div className="flex items-center text-sm">
                                                    <XIcon className="h-3.5 w-3.5 mr-2" />
                                                    Remove
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <div className="px-2 py-1 text-xs text-gray-500">
                                                Replace with:
                                            </div>
                                            {suggestions.slice(0, 5).map((suggestion, suggestionIndex) => (
                                                <DropdownMenuItem
                                                    key={`${suggestion.id}-${suggestionIndex}`}
                                                    onClick={() => handleReplaceVariable(index, suggestion)}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="font-medium">{suggestion.name}</span>
                                                        <span className="text-xs text-gray-500">{suggestion.category}</span>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        ))}

                        <input
                            ref={inputRef}
                            type="text"
                            className="outline-none flex-grow min-w-[100px] text-gray-800"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={formula.length === 0 ? "Enter formula..." : ""}
                        />
                    </div>

                    <button
                        onClick={evaluateFormula}
                        className={cn(
                            "ml-2 px-3 py-1.5 rounded-md text-white text-sm font-medium",
                            "bg-blue-500 hover:bg-blue-600 transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        )}
                    >
                        =
                    </button>
                </div>

                {result !== null && (
                    <div className="absolute right-2 -bottom-7 text-sm font-medium text-gray-700">
                        = {result.toLocaleString()}
                    </div>
                )}

                {/* Autocomplete suggestions */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                        <div className="p-2 text-xs text-gray-500 border-b">
                            Suggestions
                        </div>
                        <ul className="py-1 max-h-60 overflow-auto">
                            {filteredSuggestions.slice(0, 7).map((suggestion, suggestionIndex) => (
                                <li
                                    key={`${suggestion.id}-${suggestionIndex}`}
                                    className={cn(
                                        "px-4 py-2 hover:bg-gray-50 cursor-pointer",
                                        "flex justify-between items-center",
                                        "transition-colors"
                                    )}
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                >
                                    <span className="font-medium">{suggestion.name}</span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {suggestion.category}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormulaInput;