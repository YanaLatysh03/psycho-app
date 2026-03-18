import Bottombar from "@/components/bottombar";
import React, {useEffect, useState} from "react";
import styles from '@/styles/chats.module.css'
import {LucideArrowLeft, LucideSearch, LucideUser} from "lucide-react";
import Head from "next/head";
import {useRouter} from "next/router";
import 'firebase/firestore';
import firebase from '@/firebase/clientApp';
import {Timestamp} from "firebase/firestore";
import {authApi, User} from "@/services/authApi";
import {checkAuth} from "@/utils/authUtils";

export default function Chats() {

    interface Msg {
        createdAt: Timestamp
        displayName: string;
        photoURL: string;
        text: string;
        uid: string;
        to: string;
        to_photo: string;
        to_uid: string;
    }

    //let now = new Date();
    //let time = now.toTimeString().split(' ')[0];

    const router = useRouter();

    const onClickFunction = () => {
        router.replace('/chatbot');
    }

    const goBack = () => {
        router.replace('/home');
    }

    const [user, setUser] = useState<User | null>();
    const [msgs, setMsgs] = useState<Msg[] | null>([]);

    useEffect(() => {
		const init = async () => {
			const isAuthed = await checkAuth(router, );
			if (!isAuthed) return;  // ← данные не грузим если не авторизован

            const user = authApi.getCurrentUser();
            setUser(user);

            const unsubscribe = fetchChats();
            return () => {
                if (unsubscribe) unsubscribe(); // отписываемся при размонтировании
            };
		};

		void init();

        const fetchChats = () => {
            const db = firebase.firestore();
            const user = authApi.getCurrentUser();
            if (!user?.id) return; // если пользователя нет, ничего не делаем

            // Устанавливаем слушатель на коллекцию chat
            const unsubscribe = db.collection('users').doc(user.id).collection('chat')
                .onSnapshot((querySnapshot) => {
                    const msgArray: Msg[] = [];
                    querySnapshot.forEach(doc => {
                        msgArray.push(doc.data() as Msg);
                    });
                    setMsgs(msgArray);          // обновляем состояние
                    console.log('msgs:', msgArray); // выводим актуальные данные
                }, (error) => {
                    console.error('Ошибка слушателя:', error);
                });

            return unsubscribe; // возвращаем функцию отписки
        };
    }, [router]);


    return (
        <>
            <Head>
                <title>
                    Чаты
                </title>
            </Head>
            <div className={styles.header}>
                <div className={styles.top}>
                    <LucideArrowLeft onClick={goBack} className={styles.arrow}/>
                    <p>Чаты</p>
                </div>
            </div>
            {/*<div className={styles.search}>*/}
            {/*    <div className={styles.searchInput}>*/}
            {/*        <LucideSearch/>*/}
            {/*    </div>*/}
            {/*</div>*/}
            <div className={styles.chatContainer}>
                <div className={styles.chatList}>
                    {msgs?.length == 0 && (
                        <div className={styles.card}>
                            <div className={styles.title}>У вас еще нет чатов</div>
                            <p style={{ color: '#666', marginBottom: '20px' }}>
                                {user?.role == 'USER' ? (
                                    "Сначала отправьте заявку специалисту"
                                ) : (
                                    "Примите заявку от пациента и начните чат"
                                )}
                            </p>
                            {user?.role == 'USER' ? (
                                <button
                                    className={styles.btn}
                                    onClick={() => router.push('/search')}
                                >
                                    Выбрать специалиста
                                </button>
                            ) : (
                                <button
                                    className={styles.btn}
                                    onClick={() => router.push('/specialist/patients')}
                                >
                                    Перейти к пациентам
                                </button>
                            )}
                        </div>
                    )}
                    {/*`todo AI bot*/}
                    {/*<div className={styles.chat} onClick={onClickFunction}>*/}
                    {/*    <div className={styles.chatAvatar}>*/}
                    {/*        <LucideUser></LucideUser>*/}
                    {/*    </div>*/}
                    {/*    <div className={styles.chatInfo}>*/}
                    {/*        <div className={styles.chatName}>ChatBot</div>*/}
                    {/*        <div className={styles.chatPreview}>*/}
                    {/*            Hey, I am an AI therapist*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*    <div className={styles.chatTime}></div>*/}
                    {/*</div>*/}
                    {/* Here i want the list of chats from firestore, users => uid => chat => all the sender uids => messages => all msgs docs with displayName, photoUrl, text, createdAt and uid */}
                    <br/>
                    {msgs?.map((msg) => {
                        console.log(msg)
                        const pfp = (msg: Msg) => {
                            return msg.to_photo
                        }
                        const name = (msg: Msg) => {
                            return msg.to
                        }

                        const getUid = (msg: Msg) => {
                            return msg.to_uid
                        }

                        const Name = name(msg);
                        const url = pfp(msg);

                        const goToChat = () => {
                            const uid = getUid(msg);

                            router.replace({
                                pathname: '/chat',
                                query: {
                                    opponentId: uid,
                                    opponentName: Name
                                }
                            });

                        }

                        return (
                            <div>
                                <div className={styles.chat} onClick={goToChat}>
                                    {/*<div className={styles.chatAvatar}>*/}
                                    <img className={styles.chatAvatar} src={url} alt=""/>
                                    {/*</div>*/}
                                    <div className={styles.chatInfo}>
                                        <div className={styles.chatName}>{Name}</div>
                                        <div className={styles.chatPreview}>{msg.text}</div>
                                    </div>
                                    <div
                                        className={styles.chatTime}>{msg.createdAt.toDate().toLocaleString()}</div>
                                </div>
                                <br/>
                            </div>
                        )
                    })}
                </div>
                {/*<div className={styles.chatWindow}>
          <div className={styles.messageContainer}>
            <div className={styles.message}>
              <div className={styles.messageText}>
                Hey, how's it going?
              </div>
              <div className={styles.messageTime}>10:30 AM</div>
            </div>
            <div className={styles.message}>
              <div className={styles.messageText}>
                Not bad, you?
              </div>
              <div className={styles.messageTime}>10:31 AM</div>
            </div>
          </div>
          <div className={styles.messageInput}>
            <input type="text" placeholder="Type your message here" />
            <button>Send</button>
          </div>
        </div>*/}
            </div>
            <Bottombar/>
        </>
    )
}
