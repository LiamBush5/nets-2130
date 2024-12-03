'use client'

import { useState, useEffect, useCallback } from 'react'
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
    const [showAttentionCheck, setShowAttentionCheck] = useState(false)
    const [isDisqualified, setIsDisqualified] = useState(false)
    const [attentionTimer, setAttentionTimer] = useState<NodeJS.Timeout | null>(null)
    const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false)

    useEffect(() => {
        const checkUserCompletion = async () => {
            if (!userId) return;

            try {
                const { data: responses, error } = await supabase
                    .from('user_responses')
                    .select('question_id')
                    .eq('user_id', userId)
                    .limit(1);

                if (error) {
                    throw error;
                }

                if (responses && responses.length > 0) {
                    setHasCompletedQuiz(true);
                    setLoading(false);
                    return;
                }

                // Only fetch questions if user hasn't played
                fetchAllQuestions();
            } catch (error) {
                console.error('Error checking user completion:', error);
                setLoading(false);
                router.push('/');
            }
        };

        // Retrieve userId from localStorage
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(parseInt(storedUserId));
            checkUserCompletion();
        } else {
            // Redirect to login if userId is not found
            router.push('/login');
        }
    }, [router, userId]);

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

    const handleAttentionCheck = useCallback(() => {
        if (attentionTimer) {
            clearTimeout(attentionTimer)
        }
        setShowAttentionCheck(false)
    }, [attentionTimer])

    const handleOptionClick = async (option: string) => {
        if (isDisqualified) {
            alert('You have been disqualified due to inactivity.')
            router.push('/')
            return
        }

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

        setTimeout(() => {
            setSelectedOption(null)
            if (currentQuestionIndex + 1 < questions.length) {
                if (currentQuestionIndex + 1 === Math.floor(questions.length / 2)) {
                    setShowAttentionCheck(true)
                    const timer = setTimeout(() => {
                        setIsDisqualified(true)
                        alert('You have been disqualified due to inactivity.')
                        router.push('/')
                    }, 30000)
                    setAttentionTimer(timer)
                } else {
                    setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
                }
            } else {
                // End of quiz - just set completion state
                setHasCompletedQuiz(true)
            }
        }, 1000)
    }

    if (isDisqualified) {
        return <div>You have been disqualified due to inactivity.</div>
    }

    if (hasCompletedQuiz) {
        return (
            <Card className="p-6">
                <CardHeader>
                    <CardTitle className="text-center">Thank you for playing!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center">You have already completed the quiz.</p>
                    <p className="text-center mt-4">
                        Visit the stats page to see how you performed.
                    </p>
                </CardContent>
            </Card>
        );
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
            {showAttentionCheck ? (
                <CardContent className="space-y-6">
                    <div className="text-center text-3xl font-bold mb-6">
                        Are you still paying attention?
                    </div>
                    <Button
                        variant="default"
                        className="w-full p-4"
                        onClick={() => {
                            handleAttentionCheck()
                            setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
                        }}
                    >
                        Yes, I am still here!
                    </Button>
                </CardContent>
            ) : (
                <>
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
                </>
            )}
        </Card>
    )
}
