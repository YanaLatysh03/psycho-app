import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '@/styles/bottombar.module.css'
import { LucideEdit, LucideHome, LucideMessageSquare, LucideSearch, LucideBell } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Bottombar() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    setUserRole(role);
  }, []);

  return (
      <div className={styles.bottombar}>
        {/* Главная - разная для USER и SPECIALIST */}
        <Link href={userRole === 'SPECIALIST' ? '/specialist/home' : '/home'}>
          <div className={
            router.pathname === '/home' || router.pathname === '/specialist/home'
                ? styles.active
                : ''
          }>
            <LucideHome className='icons' />
          </div>
        </Link>

        {/* Чаты - для всех */}
        <Link href="/chats">
          <div className={router.pathname === '/chats' ? styles.active : ''}>
            <LucideMessageSquare className='icons' />
          </div>
        </Link>

        {/* Поиск (USER) / Запросы (SPECIALIST) */}
        {userRole === 'SPECIALIST' ? (
            <Link href="/specialist/requests">
              <div className={router.pathname === '/specialist/requests' ? styles.active : ''}>
                <LucideBell className='icons' />
              </div>
            </Link>
        ) : (
            <Link href="/search">
              <div className={router.pathname === '/search' ? styles.active : ''}>
                <LucideSearch className='icons' />
              </div>
            </Link>
        )}

        {/* Тесты - для всех */}
        <Link href="/quizes">
          <div className={router.pathname === '/quizes' ? styles.active : ''}>
            <LucideEdit className='icons' />
          </div>
        </Link>
      </div>
  );
}
