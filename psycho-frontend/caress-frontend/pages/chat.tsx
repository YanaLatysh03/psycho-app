import Head from 'next/head';
import React, {useRef, useState, useEffect} from 'react';
import styles from '@/styles/chats.module.css';
import {LucideArrowLeft, LucideSend, LucideUser} from 'lucide-react';
import {useRouter} from 'next/router';
import firebase from '@/firebase/clientApp';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import 'firebase/firestore';
import {checkAuth} from "@/utils/authUtils";
import {authApi, User} from "@/services/authApi";

export default function Chat() {
    const router = useRouter();

    const goBack = () => {
        router.replace("/chats");
    }

    const [user, setUser] = useState<User | null>();
    const [formValue, setFormValue] = useState('');
    const dummy = useRef();
    const firestore = firebase.firestore();


    useEffect(() => {
        const init = async () => {
            const isAuthed = await checkAuth(router);
            if (!isAuthed) return;  // ← данные не грузим если не авторизован

            const user = authApi.getCurrentUser();
            setUser(user);
        };

        void init();
    }, []);

    const {opponentId, opponentName, therapistPhotoUrl} = router.query;
    const opponentuId: string = opponentId as string;
    const messagesRef = firestore.collection('users').doc(user?.id).collection('chat').doc(opponentuId).collection('messages');
    const query = messagesRef.orderBy('createdAt').limitToLast(25);
    let [messages] = useCollectionData(query, {idField: 'id'});

    useEffect(() => {
        dummy.current.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();

        const {id} = user;
        const displayName = user?.email?.split('@')[0];

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            id,
            displayName,
            photoURL: `https://i.pravatar.cc/150?u=${id}`,
        });

        firestore.collection('users').doc(user?.id).collection('chat').doc(opponentuId).set({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            displayName,
            text: formValue,
            photoURL: `https://i.pravatar.cc/150?u=${id}`,
            id,
            to: opponentName,
            to_photo: `https://i.pravatar.cc/150?u=${opponentId}`,
            to_uid: opponentId,
        })

        firestore.collection('users').doc(opponentuId).collection('chat').doc(user?.id).collection('messages').add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            id,
            displayName,
            photoURL: `https://i.pravatar.cc/150?u=${id}`,
        })

        firestore.collection('users').doc(opponentuId).collection('chat').doc(user?.id).set({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            displayName: opponentName,
            text: formValue,
            photoURL: `https://i.pravatar.cc/150?u=${opponentId}`,
            uid: opponentId,
            to: displayName,
            to_photo: `https://i.pravatar.cc/150?u=${id}`,
            to_uid: id,
        })


        dummy.current.scrollIntoView({behavior: 'smooth'})


        setFormValue('');
        dummy.current.scrollIntoView({behavior: 'smooth'});
    };

    const photoURL = user?.photoURL;

    function ChatMessage(props) {
        const {text, id, displayName, photoURL, createdAt} = props.message;
        const messageClass = id === user?.id ? styles.sent : styles.received;


        return (
            <div className={`${styles.message} ${messageClass}`}>
                {photoURL ? <img className={styles.img} src={photoURL}/> :
                    <div className={styles.chatAvatars}><LucideUser/></div>}
                <p className={styles.text}>
                    {text}
                    <sub className={styles.time}>{createdAt?.toDate().toLocaleString().split(',')[1]}</sub>
                </p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>
                    Чат с {opponentName}
                </title>
            </Head>
            <div className={styles.headerr}>
                <div className={styles.icon}>
                    <LucideArrowLeft onClick={goBack} className={styles.arrow}/>
                    {/*<div className={styles.chatAvatar}>*/}
                    <img className={styles.chatAvatar} src={`https://i.pravatar.cc/150?u=${opponentId}`} alt=""/>
                    {/*</div>*/}
                    <p className={styles.name}>
                        {opponentName}
                    </p>
                </div>
            </div>
            <div className={styles.messageArea}>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
            </div>
            <span ref={dummy}></span>
            <form className={styles.form} onSubmit={sendMessage}>

                <input className={styles.input} value={formValue} onChange={(e) => setFormValue(e.target.value)}
                       placeholder="Введите сообщение..."/>

                <button className={styles.button} type="submit" disabled={!formValue}><LucideSend/></button>

            </form>
        </>
    );
}
