import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import {authApi, User} from "@/services/authApi";
import {checkAuth} from "@/utils/authUtils";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

	const router =  useRouter();

	useEffect(() => {
		const init = async () => {
			// Проверяем токен + валидность на сервере
			const isAuthed = await checkAuth(router);
			if (!isAuthed) return; // checkAuth сам редиректит на /auth/login

			// Токен валидный — редиректим по роли
			const role = authApi.getUserRole();
			router.replace(role === 'SPECIALIST' ? '/specialist/home' : '/home');
		};

		void init();
	}, []);

  return (
    <>
      <Head>
        <title>Caress App</title>
        <meta name="description" content="Taking care of your mind one step at a time" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
      </main>
    </>
  )
}
