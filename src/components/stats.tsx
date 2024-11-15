'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

type QuestionData = {
    question_id: number;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
}

type UserResponse = {
    selected_option: string;
    user?: {
        generation?: {
            generation_name: string;
        };
    };
}

type ChartDataPoint = {
    generation: string;
    'Option A': number;
    'Option B': number;
    'Option C': number;
    'Option D': number;
}

export function StatsComponent() {
    const [slangTerms, setSlangTerms] = useState<{ slang_id: number; term: string }[]>([])
    const [selectedTermId, setSelectedTermId] = useState<number | null>(null)
    const [chartData, setChartData] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState(false)
    const [questionData, setQuestionData] = useState<QuestionData | null>(null)

    useEffect(() => {
        fetchSlangTerms()
    }, [])

    const fetchSlangTerms = async () => {
        const { data, error } = await supabase
            .from('slang_terms')
            .select('slang_id, term')
            .order('term')

        if (error) {
            console.error('Error fetching slang terms:', error)
        } else {
            setSlangTerms(data)
        }
    }

    const fetchChartData = useCallback(async () => {
        setLoading(true)
        // Fetch the quiz question for the selected slang term
        const { data: questionData, error: questionError } = await supabase
            .from('quiz_questions')
            .select(`
        question_id,
        option_a,
        option_b,
        option_c,
        option_d
      `)
            .eq('slang_id', selectedTermId)
            .single()

        if (questionError) {
            console.error('Error fetching quiz question:', questionError)
            setLoading(false)
            return
        }

        setQuestionData(questionData)

        // Fetch user responses for this question
        const { data: responsesData, error: responsesError } = await supabase
            .from('user_responses')
            .select(`
        selected_option,
        user:users (
          generation:generations (
            generation_name
          )
        )
      `)
            .eq('question_id', questionData.question_id)

        if (responsesError) {
            console.error('Error fetching user responses:', responsesError)
            setLoading(false)
            return
        }

        // Process the data
        processChartData(responsesData, questionData)
        setLoading(false)
    }, [selectedTermId])

    useEffect(() => {
        if (selectedTermId !== null) {
            fetchChartData()
        }
    }, [selectedTermId, fetchChartData])

    const processChartData = (responses: UserResponse[], questionData: QuestionData) => {
        type OptionKey = 'Option A' | 'Option B' | 'Option C' | 'Option D';

        // Map options to labels
        const optionLabels = {
            [questionData.option_a]: 'Option A',
            [questionData.option_b]: 'Option B',
            [questionData.option_c]: 'Option C',
            [questionData.option_d]: 'Option D',
        }

        // Initialize counts
        const generations = ['Gen Z', 'Millennials', 'Gen X', 'Baby Boomers']
        const data = generations.map((gen) => ({
            generation: gen,
            'Option A': 0,
            'Option B': 0,
            'Option C': 0,
            'Option D': 0,
        }))

        // Count responses
        responses.forEach((response) => {
            const generationName = response.user?.generation?.generation_name || 'Unknown'
            const optionLabel = optionLabels[response.selected_option] || 'Other'

            const generationData = data.find((d) => d.generation === generationName)
            if (generationData && optionLabel) {
                generationData[optionLabel as OptionKey] += 1
            }
        })

        setChartData(data)
    }

    const getColor = (index: number) => {
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57']
        return colors[index % colors.length]
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>What Each Generation Thinks a Word Means</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <Select
                    value={selectedTermId ? selectedTermId.toString() : ''}
                    onValueChange={(value) => setSelectedTermId(parseInt(value))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a slang term" />
                    </SelectTrigger>
                    <SelectContent>
                        {slangTerms.map((term) => (
                            <SelectItem key={term.slang_id} value={term.slang_id.toString()}>
                                {term.term}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedTermId && questionData && (
                    <div>
                        <h3 className="text-lg font-bold">Options:</h3>
                        <ul className="list-disc list-inside">
                            <li>
                                <strong>Option A:</strong> {questionData.option_a}
                            </li>
                            <li>
                                <strong>Option B:</strong> {questionData.option_b}
                            </li>
                            <li>
                                <strong>Option C:</strong> {questionData.option_c}
                            </li>
                            <li>
                                <strong>Option D:</strong> {questionData.option_d}
                            </li>
                        </ul>
                    </div>
                )}

                {loading ? (
                    <div>Loading chart data...</div>
                ) : chartData.length > 0 ? (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="generation" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                {['Option A', 'Option B', 'Option C', 'Option D'].map((key, index) => (
                                    <Bar key={key} dataKey={key} fill={getColor(index)} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div>No responses available for this term.</div>
                )}
            </CardContent>
        </Card>
    )
}
