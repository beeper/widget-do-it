"use client"

import dynamic from 'next/dynamic'
import {useWidgetApi} from '@beeper/matrix-widget-toolkit-react';
import {EventDirection, WidgetEventCapability} from '@beeper/matrix-widget-api';
import {useState, useEffect} from 'react';
import {
    Box
} from '@mui/material';
// import {RoomEvent} from '@beeper/matrix-widget-toolkit-api';
import { useChat } from 'ai/react'
import {Message} from "ai";

const MuiCapabilitiesGuard = dynamic(() => import('@beeper/matrix-widget-toolkit-mui').then((mod) => mod.MuiCapabilitiesGuard), {
    ssr: false,
})

export default function WidgetPage() {
    return (
        <>
            <Box m={1}>
                <MuiCapabilitiesGuard
                    capabilities={[
                        // WidgetEventCapability.forStateEvent(
                        //     EventDirection.Receive,
                        //     'm.room.member'
                        // ),
                        WidgetEventCapability.forRoomEvent(
                            EventDirection.Receive,
                            'm.room.message'
                        ),
                        WidgetEventCapability.forRoomEvent(
                            EventDirection.Send,
                            'm.room.message'
                        ),
                        // WidgetEventCapability.forRoomEvent(
                        //     EventDirection.Receive,
                        //     'm.reaction'
                        // ),
                        // WidgetEventCapability.forRoomEvent(
                        //     EventDirection.Receive,
                        //     'm.room.redaction'
                        // ),
                        // WidgetEventCapability.forRoomAccountData(
                        //     EventDirection.Receive,
                        //     'm.fully_read'
                        // ),
                    ]}
                >
                    <WidgetPageContent/>
                </MuiCapabilitiesGuard>
            </Box>
        </>
    );
};

export interface RoomMessageEvent {
    msgtype: string;
    body: string;
}

function WidgetPageContent() {

    const [hover, setHover] = useState(false);

    const { messages, input, handleInputChange, handleSubmit, append } = useChat()

    const widgetApi = useWidgetApi();

    async function fetchData(useUnread: boolean, limit: number = 500) {
        let roomEvents: any[] = await widgetApi.receiveRoomEvents('m.room.message', { limit: 20 });
        return roomEvents;
    }

    useEffect(() => {
        fetchData(false)
            .then((messages) => {
                let messages_text: string[] = []
                messages.forEach((message) => {
                    messages_text.push(message.content.body);
                })

                // You are a button on the sidebar of the user's chat app. When the user clicks you, they would like you to do something based on the messages in the chat, shown below. This might mean providing information or clarification or acting on a request. Look at what the messages say and figure out what the user wants. Provide the user with the requested information or action. Prioritize the most recent messages. Messages:

                append({
                    role: 'user',
                    content: `You exist on the sidebar of a user's chat. When the user clicks a button to bring you up, the user is looking for you do something based on the most recent messages. This might mean providing information or clarification, taking action, etc. Look at what the messages say and figure out what the user most likely wants. Provide the user with the thing that they want. Messages:
${messages_text.toString()}
        
Output:\n`
                })
            })
    }, []);

    async function sendMessage(event: any) {
        console.log(event)
        await widgetApi.sendRoomEvent("m.room.message", {
            msgtype: 'm.text', body: event.target.innerText
        })
    }

    function SingleMessage({m}: {m: Message}) {
        const [hover, setHover] = useState(false);

        return (
            <div className={`${m.role === 'user' && "bg-gray-700 text-white"} relative rounded border-2 border-white p-2 hover:border-gray-700`}  onClick={sendMessage} onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)}>
                { hover && <p className="text-center absolute top-0 left-0 right-0 max-w-sm mx-auto mt-2">Click to send to chat</p>}
                <pre className={`${ hover && "blur-md" } whitespace-pre-wrap font-sans`}>{m.content}</pre>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
            {messages.slice(1).map(m => (
                <SingleMessage key={m.id} m={m} />
            ))}

            <form onSubmit={handleSubmit}>
                <input
                    className="fixed w-full max-w-xs bottom-0 border border-gray-400 rounded mb-8 shadow-xl p-2"
                    value={input}
                    onChange={handleInputChange}
                />
                {/*<button type="submit">Send</button>*/}
            </form>
        </div>
    )
}