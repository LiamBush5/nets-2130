'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuizQuestion {
    question_id: number
    slang_id: number
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    created_at: string
    slang_term: {
        term: string
    }
}

export function PlayComponent() {
    const router = useRouter()
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [userId, setUserId] = useState<number | null>(null)
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([])

    useEffect(() => {
        // Retrieve userId from localStorage
        const storedUserId = localStorage.getItem('userId')
        if (storedUserId) {
            setUserId(parseInt(storedUserId))
        } else {
            // Redirect to login if userId is not found
            router.push('/login')
        }

        fetchAllQuestions()
    }, [router])

    useEffect(() => {
        if (questions[currentQuestionIndex]) {
            const currentQuestion = questions[currentQuestionIndex]
            const options = [
                currentQuestion.option_a,
                currentQuestion.option_b,
                currentQuestion.option_c,
                currentQuestion.option_d,
            ].sort(() => Math.random() - 0.5)
            setShuffledOptions(options)
        }
    }, [currentQuestionIndex, questions])

    const fetchAllQuestions = async () => {
        setLoading(true)
        const { data: questionsData, error: questionsError } = await supabase
            .from('quiz_questions')
            .select(`
        *,
        slang_term:slang_terms!slang_id (
          term
        )
      `)

        if (questionsError) {
            console.error('Error fetching quiz questions:', questionsError)
            setLoading(false)
            return
        }

        if (questionsData) {
            // Shuffle the questions
            const shuffledQuestions = questionsData.sort(() => Math.random() - 0.5)
            setQuestions(shuffledQuestions)
        } else {
            console.warn('No quiz questions available.')
        }

        setLoading(false)
    }

    const handleOptionClick = async (option: string) => {
        if (!userId) {
            alert('User not found. Please log in again.')
            router.push('/login')
            return
        }

        const currentQuestion = questions[currentQuestionIndex]

        // Record user response
        const { error: insertError } = await supabase.from('user_responses').insert({
            user_id: userId,
            question_id: currentQuestion.question_id,
            selected_option: option,
        })

        if (insertError) {
            console.error('Error inserting user response:', insertError)
            alert('An error occurred while submitting your response.')
            return
        }

        setSelectedOption(option)

        // Move to the next question after a delay
        setTimeout(() => {
            setSelectedOption(null)
            if (currentQuestionIndex + 1 < questions.length) {
                setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
            } else {
                // End of quiz
                alert('Thank you for completing the quiz!')
                // Optionally redirect to a results page or home
                router.push('/')
            }
        }, 1000)
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (questions.length === 0) {
        return <div>No questions available.</div>
    }

    const currentQuestion = questions[currentQuestionIndex]

    return (
        <Card>
            <CardHeader>
                <CardTitle>What Does This Term Mean?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center text-3xl font-bold mb-6">
                    &ldquo;{currentQuestion.slang_term.term}&rdquo;
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shuffledOptions.map((option, index) => (
                            <Button
                                key={index}
                                variant={selectedOption === option ? 'default' : 'outline'}
                                className="p-4 h-auto text-left justify-start"
                                onClick={() => handleOptionClick(option)}
                                disabled={!!selectedOption}
                            >
                                {option}
                                <ArrowRight className="ml-auto h-4 w-4" />
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2 mt-6">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                    </div>
                    <Progress
                        value={((currentQuestionIndex + 1) / questions.length) * 100}
                        className="w-full"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
