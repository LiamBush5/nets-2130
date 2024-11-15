// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { supabase } from '@/lib/supabaseClient'
// import { useRouter } from 'next/navigation'
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import { Button } from '@/components/ui/button'
// import { Send } from 'lucide-react'

// interface User {
//     user_id: number
//     email: string
//     birth_year: number
//     generation_id: number
//     created_at: string
//     generation: {
//         generation_name: string
//     }
// }

// interface SlangTerm {
//     slang_id: number
//     term: string
//     definition_gen_z?: string
//     definition_millennials?: string
//     definition_gen_x?: string
//     example_gen_z?: string
//     example_millennials?: string
//     example_gen_x?: string
// }

// // Add interface for quiz data
// interface QuizInsertData {
//     slang_id: number
//     option_a: string
//     option_b: string
//     option_c: string
//     option_d: string
// }

// // Add new interface for Supabase response
// interface SupabaseUserData {
//     user_id: number
//     email: string
//     birth_year: number
//     generation_id: number
//     created_at: string
//     generation: {
//         generation_name: string
//     }[]
// }

// export function ContributeComponent() {
//     const router = useRouter()
//     const [user, setUser] = useState<User | null>(null)
//     const [slangTerm, setSlangTerm] = useState('')
//     const [exampleSentence, setExampleSentence] = useState('')
//     const [definition, setDefinition] = useState('')
//     const [error, setError] = useState<string | null>(null)
//     const [successMessage, setSuccessMessage] = useState<string | null>(null)
//     const [incompleteSlangTerms, setIncompleteSlangTerms] = useState<SlangTerm[]>([])

//     useEffect(() => {
//         const fetchUser = async () => {
//             const userId = localStorage.getItem('userId')
//             if (!userId) {
//                 router.push('/login')
//                 return
//             }

//             const { data, error } = await supabase
//                 .from('users')
//                 .select(`
//                     user_id,
//                     email,
//                     birth_year,
//                     generation_id,
//                     created_at,
//                     generation:generations (
//                         generation_name
//                     )
//                 `)
//                 .eq('user_id', parseInt(userId))
//                 .single()

//             if (error || !data) {
//                 console.error('Error fetching user data:', error)
//                 router.push('/login')
//             } else {
//                 // Map SupabaseUserData to User
//                 const supabaseUserData = data as SupabaseUserData

//                 // Ensure generation array is not empty
//                 if (supabaseUserData.generation.length === 0) {
//                     console.error('No generation data found for user')
//                     router.push('/login')
//                     return
//                 }

//                 const generation = supabaseUserData.generation[0]

//                 const userData: User = {
//                     user_id: supabaseUserData.user_id,
//                     email: supabaseUserData.email,
//                     birth_year: supabaseUserData.birth_year,
//                     generation_id: supabaseUserData.generation_id,
//                     created_at: supabaseUserData.created_at,
//                     generation: generation
//                 }

//                 setUser(userData)
//             }
//         }

//         fetchUser()
//     }, [router])

//     // Fetch incomplete slang terms when user is set
//     useEffect(() => {
//         if (user) {
//             fetchIncompleteSlangTerms()
//         }
//     }, [user, fetchIncompleteSlangTerms])

//     const getDefinitionColumn = (generationName: string) => {
//         switch (generationName) {
//             case 'Gen Z':
//                 return 'definition_gen_z'
//             case 'Millennials':
//                 return 'definition_millennials'
//             case 'Gen X':
//             case 'Baby Boomers':
//                 return 'definition_gen_x'
//             default:
//                 return null
//         }
//     }

//     // Wrap fetchIncompleteSlangTerms in useCallback
//     const fetchIncompleteSlangTerms = useCallback(async () => {
//         if (!user) return

//         const generationName = user.generation.generation_name
//         const definitionColumn = getDefinitionColumn(generationName)

//         if (!definitionColumn) {
//             return
//         }

//         const { data, error } = await supabase
//             .from('slang_terms')
//             .select('slang_id, term')
//             .is(definitionColumn, null)

//         if (error) {
//             console.error('Error fetching incomplete slang terms:', error)
//             return
//         }

//         setIncompleteSlangTerms(data)
//     }, [user]) // Add user as dependency

//     const handleContributeSubmit = async (e: React.FormEvent) => {
//         e.preventDefault()
//         setError(null)
//         setSuccessMessage(null)

//         if (!user) {
//             setError('User not found.')
//             return
//         }

//         try {
//             // Check if the slang term already exists
//             const { data: existingSlang, error: fetchError } = await supabase
//                 .from('slang_terms')
//                 .select('*')
//                 .eq('term', slangTerm.trim().toLowerCase())
//                 .single()

//             if (fetchError && fetchError.code !== 'PGRST116') {
//                 // If error is not 'No rows found', then log and return
//                 console.error('Error fetching slang term:', fetchError)
//                 setError('An error occurred while checking the slang term.')
//                 return
//             }

//             let slangId: number

//             if (existingSlang) {
//                 // Slang term exists, update the definition for the user's generation
//                 slangId = existingSlang.slang_id

//                 const updates: Partial<SlangTerm> = {}
//                 const generationName = user.generation.generation_name

//                 if (generationName === 'Gen Z') {
//                     if (existingSlang.definition_gen_z) {
//                         setError('You have already contributed to this term.')
//                         return
//                     }
//                     updates.definition_gen_z = definition
//                     updates.example_gen_z = exampleSentence
//                 } else if (generationName === 'Millennials') {
//                     if (existingSlang.definition_millennials) {
//                         setError('You have already contributed to this term.')
//                         return
//                     }
//                     updates.definition_millennials = definition
//                     updates.example_millennials = exampleSentence
//                 } else if (generationName === 'Gen X' || generationName === 'Baby Boomers') {
//                     if (existingSlang.definition_gen_x) {
//                         setError('You have already contributed to this term.')
//                         return
//                     }
//                     updates.definition_gen_x = definition
//                     updates.example_gen_x = exampleSentence
//                 } else {
//                     setError('Your generation is not supported for contributions.')
//                     return
//                 }

//                 const { error: updateError } = await supabase
//                     .from('slang_terms')
//                     .update(updates)
//                     .eq('slang_id', slangId)

//                 if (updateError) {
//                     console.error('Error updating slang term:', updateError)
//                     setError('An error occurred while updating the slang term.')
//                     return
//                 }
//             } else {
//                 // Slang term does not exist, create new entry
//                 const newSlangData: Partial<SlangTerm> & {
//                     submitted_by: number
//                     contributor_birth_year: number
//                     contributor_generation_id: number
//                 } = {
//                     term: slangTerm.trim().toLowerCase(),
//                     submitted_by: user.user_id,
//                     contributor_birth_year: user.birth_year,
//                     contributor_generation_id: user.generation_id,
//                 }

//                 const generationName = user.generation.generation_name

//                 if (generationName === 'Gen Z') {
//                     newSlangData.definition_gen_z = definition
//                     newSlangData.example_gen_z = exampleSentence
//                 } else if (generationName === 'Millennials') {
//                     newSlangData.definition_millennials = definition
//                     newSlangData.example_millennials = exampleSentence
//                 } else if (generationName === 'Gen X' || generationName === 'Baby Boomers') {
//                     newSlangData.definition_gen_x = definition
//                     newSlangData.example_gen_x = exampleSentence
//                 } else {
//                     setError('Your generation is not supported for contributions.')
//                     return
//                 }

//                 const { data: insertData, error: insertError } = await supabase
//                     .from('slang_terms')
//                     .insert([newSlangData])
//                     .select('slang_id')
//                     .single()

//                 if (insertError) {
//                     console.error('Error inserting slang term:', insertError)
//                     setError('An error occurred while submitting your slang term.')
//                     return
//                 }

//                 slangId = insertData.slang_id
//             }

//             // Check if all three definitions are filled
//             const { data: updatedSlang, error: fetchUpdatedError } = await supabase
//                 .from('slang_terms')
//                 .select('*')
//                 .eq('slang_id', slangId)
//                 .single()

//             if (fetchUpdatedError || !updatedSlang) {
//                 console.error('Error fetching updated slang term:', fetchUpdatedError)
//                 setError('An error occurred while processing the slang term.')
//                 return
//             }

//             if (
//                 updatedSlang.definition_gen_z &&
//                 updatedSlang.definition_millennials &&
//                 updatedSlang.definition_gen_x
//             ) {
//                 // All definitions are filled, add to quiz_questions
//                 let quizInsertData: QuizInsertData | null = null
//                 let quizInsertError: Error | null = null

//                 // Prepare options
//                 const options = [
//                     updatedSlang.definition_gen_z,
//                     updatedSlang.definition_millennials,
//                     updatedSlang.definition_gen_x,
//                 ]

//                 // Log slangId and options
//                 console.log('slangId:', slangId)
//                 console.log('Options:', options)

//                 // Insert into quiz_questions
//                 const result = await supabase
//                     .from('quiz_questions')
//                     .insert([
//                         {
//                             slang_id: slangId,
//                             option_a: options[0],
//                             option_b: options[1],
//                             option_c: options[2],
//                             option_d: "I don't know", // Explicitly provide option_d
//                         },
//                     ])

//                 quizInsertData = result.data
//                 quizInsertError = result.error

//                 if (quizInsertError) {
//                     console.error(
//                         'Error inserting into quiz_questions:',
//                         JSON.stringify(quizInsertError, null, 2)
//                     )
//                     // Not critical, so we can proceed
//                 } else {
//                     console.log('Successfully inserted into quiz_questions:', quizInsertData)
//                 }
//             }

//             setSuccessMessage('Slang term submitted successfully!')
//             // Reset form fields
//             setSlangTerm('')
//             setExampleSentence('')
//             setDefinition('')
//             // Fetch the updated list of incomplete slang terms
//             fetchIncompleteSlangTerms()
//         } catch (err) {
//             console.error('Error during submission:', err)
//             setError('An unexpected error occurred. Please try again.')
//         }
//     }

//     if (!user) {
//         return <div>Loading...</div>
//     }

//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Contribute Your Slang Knowledge</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 {error && <p className="text-red-500 mb-4">{error}</p>}
//                 {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
//                 <form onSubmit={handleContributeSubmit} className="space-y-4">
//                     <div>
//                         <label htmlFor="slangTerm" className="block text-sm font-medium mb-1">
//                             Slang Term:
//                         </label>
//                         <Input
//                             id="slangTerm"
//                             placeholder="Enter a slang term"
//                             value={slangTerm}
//                             onChange={(e) => setSlangTerm(e.target.value)}
//                             required
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="exampleSentence" className="block text-sm font-medium mb-1">
//                             Example Sentence:
//                         </label>
//                         <Input
//                             id="exampleSentence"
//                             placeholder="Provide an example sentence"
//                             value={exampleSentence}
//                             onChange={(e) => setExampleSentence(e.target.value)}
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="definition" className="block text-sm font-medium mb-1">
//                             Definition:
//                         </label>
//                         <Textarea
//                             id="definition"
//                             placeholder="Enter the definition"
//                             rows={3}
//                             value={definition}
//                             onChange={(e) => setDefinition(e.target.value)}
//                             required
//                         />
//                     </div>
//                     <Button type="submit" className="w-full">
//                         Submit <Send className="ml-2 h-4 w-4" />
//                     </Button>
//                 </form>

//                 {incompleteSlangTerms.length > 0 && (
//                     <div className="mt-8">
//                         <h2 className="text-lg font-semibold mb-4">
//                             Slang Terms Awaiting Your Contribution
//                         </h2>
//                         <ul className="list-disc pl-5">
//                             {incompleteSlangTerms.map((term) => (
//                                 <li
//                                     key={term.slang_id}
//                                     className="cursor-pointer text-blue-600 hover:underline"
//                                     onClick={() => setSlangTerm(term.term)}
//                                 >
//                                     {term.term}
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 )}
//             </CardContent>
//         </Card>
//     )
// }


'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

interface User {
    user_id: number
    email: string
    birth_year: number
    generation_id: number
    created_at: string
    generation: {
        generation_name: string
    }
}

interface SlangTerm {
    slang_id: number
    term: string
    definition_gen_z?: string
    definition_millennials?: string
    definition_gen_x?: string
    example_gen_z?: string
    example_millennials?: string
    example_gen_x?: string
}

// Add interface for quiz data
interface QuizInsertData {
    slang_id: number
    option_a: string
    option_b: string
    option_c: string
    option_d: string
}

// Add new interface for Supabase response
interface SupabaseUserData {
    user_id: number
    email: string
    birth_year: number
    generation_id: number
    created_at: string
    generation: {
        generation_name: string
    }[]
}

export function ContributeComponent() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [slangTerm, setSlangTerm] = useState('')
    const [exampleSentence, setExampleSentence] = useState('')
    const [definition, setDefinition] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [incompleteSlangTerms, setIncompleteSlangTerms] = useState<SlangTerm[]>([])

    useEffect(() => {
        const fetchUser = async () => {
            const userId = localStorage.getItem('userId')
            if (!userId) {
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('users')
                .select(`
          user_id,
          email,
          birth_year,
          generation_id,
          created_at,
          generation:generations (
            generation_name
          )
        `)
                .eq('user_id', parseInt(userId))
                .single()

            if (error || !data) {
                console.error('Error fetching user data:', error)
                router.push('/login')
            } else {
                // Map SupabaseUserData to User
                const supabaseUserData = data as SupabaseUserData

                // Ensure generation array is not empty
                if (supabaseUserData.generation.length === 0) {
                    console.error('No generation data found for user')
                    router.push('/login')
                    return
                }

                const generation = supabaseUserData.generation[0]

                const userData: User = {
                    user_id: supabaseUserData.user_id,
                    email: supabaseUserData.email,
                    birth_year: supabaseUserData.birth_year,
                    generation_id: supabaseUserData.generation_id,
                    created_at: supabaseUserData.created_at,
                    generation: generation
                }

                setUser(userData)
            }
        }

        fetchUser()
    }, [router])

    // Define getDefinitionColumn before it's used
    const getDefinitionColumn = (generationName: string) => {
        switch (generationName) {
            case 'Gen Z':
                return 'definition_gen_z'
            case 'Millennials':
                return 'definition_millennials'
            case 'Gen X':
            case 'Baby Boomers':
                return 'definition_gen_x'
            default:
                return null
        }
    }

    // Wrap fetchIncompleteSlangTerms in useCallback
    const fetchIncompleteSlangTerms = useCallback(async () => {
        if (!user) return

        const generationName = user.generation.generation_name
        const definitionColumn = getDefinitionColumn(generationName)

        if (!definitionColumn) {
            return
        }

        const { data, error } = await supabase
            .from('slang_terms')
            .select('slang_id, term')
            .is(definitionColumn, null)

        if (error) {
            console.error('Error fetching incomplete slang terms:', error)
            return
        }

        setIncompleteSlangTerms(data)
    }, [user]) // Add user as dependency

    // Fetch incomplete slang terms when user is set
    useEffect(() => {
        if (user) {
            fetchIncompleteSlangTerms()
        }
    }, [user, fetchIncompleteSlangTerms])

    const handleContributeSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccessMessage(null)

        if (!user) {
            setError('User not found.')
            return
        }

        try {
            // Check if the slang term already exists
            const { data: existingSlang, error: fetchError } = await supabase
                .from('slang_terms')
                .select('*')
                .eq('term', slangTerm.trim().toLowerCase())
                .single()

            if (fetchError && fetchError.code !== 'PGRST116') {
                // If error is not 'No rows found', then log and return
                console.error('Error fetching slang term:', fetchError)
                setError('An error occurred while checking the slang term.')
                return
            }

            let slangId: number

            if (existingSlang) {
                // Slang term exists, update the definition for the user's generation
                slangId = existingSlang.slang_id

                const updates: Partial<SlangTerm> = {}
                const generationName = user.generation.generation_name

                if (generationName === 'Gen Z') {
                    if (existingSlang.definition_gen_z) {
                        setError('You have already contributed to this term.')
                        return
                    }
                    updates.definition_gen_z = definition
                    updates.example_gen_z = exampleSentence
                } else if (generationName === 'Millennials') {
                    if (existingSlang.definition_millennials) {
                        setError('You have already contributed to this term.')
                        return
                    }
                    updates.definition_millennials = definition
                    updates.example_millennials = exampleSentence
                } else if (generationName === 'Gen X' || generationName === 'Baby Boomers') {
                    if (existingSlang.definition_gen_x) {
                        setError('You have already contributed to this term.')
                        return
                    }
                    updates.definition_gen_x = definition
                    updates.example_gen_x = exampleSentence
                } else {
                    setError('Your generation is not supported for contributions.')
                    return
                }

                const { error: updateError } = await supabase
                    .from('slang_terms')
                    .update(updates)
                    .eq('slang_id', slangId)

                if (updateError) {
                    console.error('Error updating slang term:', updateError)
                    setError('An error occurred while updating the slang term.')
                    return
                }
            } else {
                // Slang term does not exist, create new entry
                const newSlangData: Partial<SlangTerm> & {
                    submitted_by: number
                    contributor_birth_year: number
                    contributor_generation_id: number
                } = {
                    term: slangTerm.trim().toLowerCase(),
                    submitted_by: user.user_id,
                    contributor_birth_year: user.birth_year,
                    contributor_generation_id: user.generation_id,
                }

                const generationName = user.generation.generation_name

                if (generationName === 'Gen Z') {
                    newSlangData.definition_gen_z = definition
                    newSlangData.example_gen_z = exampleSentence
                } else if (generationName === 'Millennials') {
                    newSlangData.definition_millennials = definition
                    newSlangData.example_millennials = exampleSentence
                } else if (generationName === 'Gen X' || generationName === 'Baby Boomers') {
                    newSlangData.definition_gen_x = definition
                    newSlangData.example_gen_x = exampleSentence
                } else {
                    setError('Your generation is not supported for contributions.')
                    return
                }

                const { data: insertData, error: insertError } = await supabase
                    .from('slang_terms')
                    .insert([newSlangData])
                    .select('slang_id')
                    .single()

                if (insertError) {
                    console.error('Error inserting slang term:', insertError)
                    setError('An error occurred while submitting your slang term.')
                    return
                }

                slangId = insertData.slang_id
            }

            // Check if all three definitions are filled
            const { data: updatedSlang, error: fetchUpdatedError } = await supabase
                .from('slang_terms')
                .select('*')
                .eq('slang_id', slangId)
                .single()

            if (fetchUpdatedError || !updatedSlang) {
                console.error('Error fetching updated slang term:', fetchUpdatedError)
                setError('An error occurred while processing the slang term.')
                return
            }

            if (
                updatedSlang.definition_gen_z &&
                updatedSlang.definition_millennials &&
                updatedSlang.definition_gen_x
            ) {
                // All definitions are filled, add to quiz_questions
                let quizInsertData: QuizInsertData | null = null
                let quizInsertError: Error | null = null

                // Prepare options
                const options = [
                    updatedSlang.definition_gen_z,
                    updatedSlang.definition_millennials,
                    updatedSlang.definition_gen_x,
                ]

                // Log slangId and options
                console.log('slangId:', slangId)
                console.log('Options:', options)

                // Insert into quiz_questions
                const result = await supabase
                    .from('quiz_questions')
                    .insert([
                        {
                            slang_id: slangId,
                            option_a: options[0],
                            option_b: options[1],
                            option_c: options[2],
                            option_d: "I don't know", // Explicitly provide option_d
                        },
                    ])

                quizInsertData = result.data
                quizInsertError = result.error

                if (quizInsertError) {
                    console.error(
                        'Error inserting into quiz_questions:',
                        JSON.stringify(quizInsertError, null, 2)
                    )
                    // Not critical, so we can proceed
                } else {
                    console.log('Successfully inserted into quiz_questions:', quizInsertData)
                }
            }

            setSuccessMessage('Slang term submitted successfully!')
            // Reset form fields
            setSlangTerm('')
            setExampleSentence('')
            setDefinition('')
            // Fetch the updated list of incomplete slang terms
            fetchIncompleteSlangTerms()
        } catch (err) {
            console.error('Error during submission:', err)
            setError('An unexpected error occurred. Please try again.')
        }
    }

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contribute Your Slang Knowledge</CardTitle>
            </CardHeader>
            <CardContent>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
                <form onSubmit={handleContributeSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="slangTerm" className="block text-sm font-medium mb-1">
                            Slang Term:
                        </label>
                        <Input
                            id="slangTerm"
                            placeholder="Enter a slang term"
                            value={slangTerm}
                            onChange={(e) => setSlangTerm(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="exampleSentence" className="block text-sm font-medium mb-1">
                            Example Sentence:
                        </label>
                        <Input
                            id="exampleSentence"
                            placeholder="Provide an example sentence"
                            value={exampleSentence}
                            onChange={(e) => setExampleSentence(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="definition" className="block text-sm font-medium mb-1">
                            Definition:
                        </label>
                        <Textarea
                            id="definition"
                            placeholder="Enter the definition"
                            rows={3}
                            value={definition}
                            onChange={(e) => setDefinition(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Submit <Send className="ml-2 h-4 w-4" />
                    </Button>
                </form>

                {incompleteSlangTerms.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold mb-4">
                            Slang Terms Awaiting Your Contribution
                        </h2>
                        <ul className="list-disc pl-5">
                            {incompleteSlangTerms.map((term) => (
                                <li
                                    key={term.slang_id}
                                    className="cursor-pointer text-blue-600 hover:underline"
                                    onClick={() => setSlangTerm(term.term)}
                                >
                                    {term.term}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
