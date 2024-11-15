// // 'use client'

// // import { useState } from 'react'
// // import { useRouter } from 'next/navigation'
// // import { supabase } from '../../lib/supabaseClient'
// // import { Button } from '@/components/ui/button'
// // import { Input } from '@/components/ui/input'

// // export default function LoginPage() {
// //     const router = useRouter()
// //     const [email, setEmail] = useState('')
// //     const [birthYear, setBirthYear] = useState('')
// //     const [error, setError] = useState<string | null>(null)

// //     const handleLogin = async (e: React.FormEvent) => {
// //         e.preventDefault()
// //         setError(null)

// //         try {
// //             // Check if the user already exists
// //             const { data: existingUser, error: selectError } = await supabase
// //                 .from('users')
// //                 .select('*')
// //                 .eq('email', email)
// //                 .single()

// //             if (selectError && selectError.code !== 'PGRST116') {
// //                 console.error('Error fetching user:', selectError)
// //                 setError('An error occurred while processing your request.')
// //                 return
// //             }

// //             let finalUser = existingUser
// //             if (!existingUser) {
// //                 // Insert new user
// //                 const { data: insertData, error: insertError } = await supabase
// //                     .from('users')
// //                     .insert({ email, birth_year: parseInt(birthYear) })
// //                     .select('*')
// //                     .single()

// //                 if (insertError) {
// //                     console.error('Error inserting user:', insertError)
// //                     setError('An error occurred while creating your account.')
// //                     return
// //                 }

// //                 finalUser = insertData
// //             }

// //             // Store user_id in localStorage
// //             localStorage.setItem('userId', finalUser.user_id)
// //             localStorage.setItem('userEmail', finalUser.email)

// //             // Redirect to /play
// //             router.push('/play')
// //         } catch (err) {
// //             console.error('Error during login:', err)
// //             setError('An error occurred. Please try again.')
// //         }
// //     }

// //     return (
// //         <div className="min-h-screen flex items-center justify-center bg-gray-100">
// //             <form
// //                 onSubmit={handleLogin}
// //                 className="p-6 bg-white rounded shadow-md w-full max-w-sm space-y-4"
// //             >
// //                 <h1 className="text-2xl font-bold text-center">Welcome to LingoLoop!</h1>
// //                 {error && <p className="text-red-500 text-center">{error}</p>}
// //                 <div>
// //                     <label htmlFor="email" className="block text-sm font-medium mb-1">
// //                         Email:
// //                     </label>
// //                     <Input
// //                         id="email"
// //                         type="email"
// //                         required
// //                         value={email}
// //                         onChange={(e) => setEmail(e.target.value)}
// //                         placeholder="you@example.com"
// //                     />
// //                 </div>
// //                 <div>
// //                     <label htmlFor="birthYear" className="block text-sm font-medium mb-1">
// //                         Birth Year:
// //                     </label>
// //                     <Input
// //                         id="birthYear"
// //                         type="number"
// //                         required
// //                         value={birthYear}
// //                         onChange={(e) => setBirthYear(e.target.value)}
// //                         placeholder="e.g., 1990"
// //                     />
// //                 </div>
// //                 <Button type="submit" className="w-full">
// //                     Continue
// //                 </Button>
// //             </form>
// //         </div>
// //     )
// // }



// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '../../lib/supabaseClient'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'

// export default function LoginPage() {
//     const router = useRouter()
//     const [email, setEmail] = useState('')
//     const [birthYear, setBirthYear] = useState('')
//     const [error, setError] = useState<string | null>(null)

//     // Function to calculate generation_id based on birth year
//     function getGenerationId(birthYear: number): number | null {
//         if (birthYear >= 1946 && birthYear <= 1964) {
//             return 1 // Baby Boomers
//         } else if (birthYear >= 1965 && birthYear <= 1980) {
//             return 2 // Gen X
//         } else if (birthYear >= 1981 && birthYear <= 1996) {
//             return 3 // Millennials
//         } else if (birthYear >= 1997 && birthYear <= 2012) {
//             return 4 // Gen Z
//         } else {
//             return null // Unknown generation
//         }
//     }

//     const handleLogin = async (e: React.FormEvent) => {
//         e.preventDefault()
//         setError(null)

//         try {
//             // Parse birth year and calculate generation_id
//             const birthYearInt = parseInt(birthYear)
//             const generationId = getGenerationId(birthYearInt)
//             if (!generationId) {
//                 setError('Invalid birth year provided.')
//                 return
//             }

//             // Check if the user already exists
//             const { data: existingUser, error: selectError } = await supabase
//                 .from('users')
//                 .select('*')
//                 .eq('email', email)
//                 .single()

//             if (selectError && selectError.code !== 'PGRST116') {
//                 console.error('Error fetching user:', selectError)
//                 setError('An error occurred while processing your request.')
//                 return
//             }

//             let finalUser = existingUser

//             if (!existingUser) {
//                 // Insert new user with generation_id
//                 const { data: insertData, error: insertError } = await supabase
//                     .from('users')
//                     .insert({
//                         email,
//                         birth_year: birthYearInt,
//                         generation_id: generationId,
//                     })
//                     .select('*')
//                     .single()

//                 if (insertError) {
//                     console.error('Error inserting user:', insertError)
//                     setError('An error occurred while creating your account.')
//                     return
//                 }

//                 finalUser = insertData
//             } else {
//                 // Existing user: update generation_id if it's missing
//                 if (!existingUser.generation_id) {
//                     const { data: updateData, error: updateError } = await supabase
//                         .from('users')
//                         .update({
//                             birth_year: birthYearInt,
//                             generation_id: generationId,
//                         })
//                         .eq('user_id', existingUser.user_id)
//                         .select('*')
//                         .single()

//                     if (updateError) {
//                         console.error('Error updating user:', updateError)
//                         setError('An error occurred while updating your account.')
//                         return
//                     }

//                     finalUser = updateData
//                 } else if (existingUser.birth_year !== birthYearInt) {
//                     // Update birth_year if it has changed
//                     const { data: updateData, error: updateError } = await supabase
//                         .from('users')
//                         .update({
//                             birth_year: birthYearInt,
//                         })
//                         .eq('user_id', existingUser.user_id)
//                         .select('*')
//                         .single()

//                     if (updateError) {
//                         console.error('Error updating birth year:', updateError)
//                         setError('An error occurred while updating your account.')
//                         return
//                     }

//                     finalUser = updateData
//                 }
//             }

//             // Store user_id in localStorage
//             localStorage.setItem('userId', finalUser.user_id)
//             localStorage.setItem('userEmail', finalUser.email)

//             // Redirect to /play
//             router.push('/play')
//         } catch (err) {
//             console.error('Error during login:', err)
//             setError('An error occurred. Please try again.')
//         }
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100">
//             <form
//                 onSubmit={handleLogin}
//                 className="p-6 bg-white rounded shadow-md w-full max-w-sm space-y-4"
//             >
//                 <h1 className="text-2xl font-bold text-center">Welcome to LingoLoop!</h1>
//                 {error && <p className="text-red-500 text-center">{error}</p>}
//                 <div>
//                     <label htmlFor="email" className="block text-sm font-medium mb-1">
//                         Email:
//                     </label>
//                     <Input
//                         id="email"
//                         type="email"
//                         required
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="you@example.com"
//                     />
//                 </div>
//                 <div>
//                     <label htmlFor="birthYear" className="block text-sm font-medium mb-1">
//                         Birth Year:
//                     </label>
//                     <Input
//                         id="birthYear"
//                         type="number"
//                         required
//                         value={birthYear}
//                         onChange={(e) => setBirthYear(e.target.value)}
//                         placeholder="e.g., 1990"
//                     />
//                 </div>
//                 <Button type="submit" className="w-full">
//                     Continue
//                 </Button>
//             </form>
//         </div>
//     )
// }


'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [birthYear, setBirthYear] = useState('')
    const [error, setError] = useState<string | null>(null)

    // Function to calculate generation_id based on birth year
    function getGenerationId(birthYear: number): number | null {
        if (birthYear >= 1946 && birthYear <= 1964) {
            return 1 // Baby Boomers
        } else if (birthYear >= 1965 && birthYear <= 1980) {
            return 2 // Gen X
        } else if (birthYear >= 1981 && birthYear <= 1996) {
            return 3 // Millennials
        } else if (birthYear >= 1997 && birthYear <= 2012) {
            return 4 // Gen Z
        } else {
            return null // Unknown generation
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        try {
            // Parse birth year and calculate generation_id
            const birthYearInt = parseInt(birthYear)
            const generationId = getGenerationId(birthYearInt)
            if (!generationId) {
                setError('Invalid birth year provided.')
                return
            }

            // Check if the user already exists
            const { data: existingUser, error: selectError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single()

            if (selectError && selectError.code !== 'PGRST116') {
                console.error('Error fetching user:', selectError)
                setError('An error occurred while processing your request.')
                return
            }

            let finalUser = existingUser

            if (!existingUser) {
                // Insert new user with generation_id
                const { data: insertData, error: insertError } = await supabase
                    .from('users')
                    .insert({
                        email,
                        birth_year: birthYearInt,
                        generation_id: generationId,
                    })
                    .select('*')
                    .single()

                if (insertError) {
                    console.error('Error inserting user:', insertError)
                    setError('An error occurred while creating your account.')
                    return
                }

                finalUser = insertData
            } else {
                // Existing user: update generation_id if it's missing
                if (!existingUser.generation_id) {
                    const { data: updateData, error: updateError } = await supabase
                        .from('users')
                        .update({
                            birth_year: birthYearInt,
                            generation_id: generationId,
                        })
                        .eq('user_id', existingUser.user_id)
                        .select('*')
                        .single()

                    if (updateError) {
                        console.error('Error updating user:', updateError)
                        setError('An error occurred while updating your account.')
                        return
                    }

                    finalUser = updateData
                } else if (existingUser.birth_year !== birthYearInt) {
                    // Update birth_year if it has changed
                    const { data: updateData, error: updateError } = await supabase
                        .from('users')
                        .update({
                            birth_year: birthYearInt,
                        })
                        .eq('user_id', existingUser.user_id)
                        .select('*')
                        .single()

                    if (updateError) {
                        console.error('Error updating birth year:', updateError)
                        setError('An error occurred while updating your account.')
                        return
                    }

                    finalUser = updateData
                }
            }

            // Store user_id in localStorage
            localStorage.setItem('userId', finalUser.user_id)
            localStorage.setItem('userEmail', finalUser.email)

            // Redirect to /play
            router.push('/play')
        } catch (err) {
            console.error('Error during login:', err)
            setError('An error occurred. Please try again.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="p-6 bg-white rounded shadow-md w-full max-w-sm space-y-4"
            >
                <h1 className="text-2xl font-bold text-center">Welcome to LingoLoop!</h1>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email:
                    </label>
                    <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label htmlFor="birthYear" className="block text-sm font-medium mb-1">
                        Birth Year:
                    </label>
                    <Input
                        id="birthYear"
                        type="number"
                        required
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        placeholder="e.g., 1990"
                    />
                </div>
                <Button type="submit" className="w-full">
                    Continue
                </Button>
            </form>
        </div>
    )
}
