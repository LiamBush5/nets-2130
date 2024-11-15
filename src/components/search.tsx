'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface SlangTerm {
    term: string;
    definition_gen_z?: string;
    definition_millennials?: string;
    definition_gen_x?: string;
    example_gen_z?: string;
    example_millennials?: string;
    example_gen_x?: string;
}

export function SearchComponent() {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<SlangTerm | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [suggestions, setSuggestions] = useState<SlangTerm[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [allTerms, setAllTerms] = useState<SlangTerm[]>([])

    useEffect(() => {
        const fetchAllTerms = async () => {
            setIsLoading(true)
            try {
                const { data, error } = await supabase
                    .from('slang_terms')
                    .select('term')
                    .order('term')

                if (error) throw error
                setAllTerms(data || [])
                setSuggestions(data || [])
            } catch (err) {
                console.error('Error fetching terms:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAllTerms()
    }, [])

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)
        setError(null)

        const filtered = allTerms.filter(item =>
            item.term.toLowerCase().includes(value.toLowerCase())
        )
        setSuggestions(filtered)
    }

    const handleSearch = async (term: string) => {
        setError(null)
        setResults(null)
        setSuggestions([])

        if (!term.trim()) {
            setError('Please enter a term to search.')
            return
        }

        try {
            const { data, error } = await supabase
                .from('slang_terms')
                .select('*')
                .ilike('term', term.trim())
                .limit(1)

            if (error) throw error

            if (data && data.length > 0) {
                setResults(data[0])
                setSearchTerm(term)
            } else {
                setError('No results found for the searched term.')
            }
        } catch (err) {
            console.error('Error during search:', err)
            setError('An unexpected error occurred. Please try again.')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Search Slang Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <div className="flex space-x-2">
                        <div className="relative w-full">
                            <Input
                                placeholder="Search for a slang term..."
                                value={searchTerm}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                onClick={() => handleSearch(searchTerm)}
                            >
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </div>

                    {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                            {suggestions.map((item, index) => (
                                <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSearch(item.term)}
                                >
                                    {item.term}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isLoading && <p className="text-gray-500">Loading suggestions...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {results && (
                    <div className="border rounded p-4">
                        <h2 className="text-xl font-bold mb-4">Term: {results.term}</h2>
                        <div className="space-y-6">
                            {results.definition_gen_z && (
                                <div>
                                    <h3 className="font-semibold">Gen Z Definition:</h3>
                                    <p className="mb-2">{results.definition_gen_z}</p>
                                    {results.example_gen_z && (
                                        <>
                                            <h4 className="font-semibold">Example Sentence:</h4>
                                            <p>{results.example_gen_z}</p>
                                        </>
                                    )}
                                </div>
                            )}
                            {results.definition_millennials && (
                                <div>
                                    <h3 className="font-semibold">Millennials Definition:</h3>
                                    <p className="mb-2">{results.definition_millennials}</p>
                                    {results.example_millennials && (
                                        <>
                                            <h4 className="font-semibold">Example Sentence:</h4>
                                            <p>{results.example_millennials}</p>
                                        </>
                                    )}
                                </div>
                            )}
                            {results.definition_gen_x && (
                                <div>
                                    <h3 className="font-semibold">Gen X/Baby Boomers Definition:</h3>
                                    <p className="mb-2">{results.definition_gen_x}</p>
                                    {results.example_gen_x && (
                                        <>
                                            <h4 className="font-semibold">Example Sentence:</h4>
                                            <p>{results.example_gen_x}</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
