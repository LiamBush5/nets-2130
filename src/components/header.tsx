'use client'

import { Button } from '@/components/ui/button'
import { GamepadIcon, BarChart as ChartIcon, Search, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Header() {
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem('userId')
        localStorage.removeItem('userEmail')
        router.push('/login')
    }

    return (
        <header className="bg-primary text-primary-foreground shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/">
                    <h1 className="text-2xl font-bold">LingoLoop</h1>
                </Link>
                <nav>
                    <ul className="flex space-x-4">
                        <li><Link href="/play"><Button variant="ghost" size="sm"><GamepadIcon className="mr-2 h-4 w-4" /> Play Game</Button></Link></li>
                        <li><Link href="/contribute"><Button variant="ghost" size="sm">Contribute</Button></Link></li>
                        <li><Link href="/stats"><Button variant="ghost" size="sm"><ChartIcon className="mr-2 h-4 w-4" /> Stats</Button></Link></li>
                        <li><Link href="/search"><Button variant="ghost" size="sm"><Search className="mr-2 h-4 w-4" /> Search</Button></Link></li>
                        <li>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}