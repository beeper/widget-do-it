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

// function WidgetPageContent() {
//
//     const {
//         complete,
//         completion,
//         isLoading
//     } = useCompletion({
//         api: '/api/completion'
//     })
//
//     const widgetApi = useWidgetApi();
//
//     async function fetchData(useUnread: boolean, limit: number = 500) {
//         let roomEvents: RoomEvent<RoomMessageEvent>[] = await widgetApi.receiveRoomEvents('m.room.message');
//         return roomEvents;
//     }
//
//     useEffect(() => {
//         fetchData(false)
//             .then((messages) => {
//                 let messages_text: string[] = []
//                 messages.forEach((message) => {
//                     messages_text.push(message.content.body);
//                 })
//
//                 complete(messages_text.toString())
//             })
//     }, []);
//
//     return (
//         <>
//             <p>{completion}</p>
//         </>
//     )
// }

function WidgetPageContent() {

    const [hover, setHover] = useState(false);

    const { messages, input, handleInputChange, handleSubmit, append } = useChat()

    const widgetApi = useWidgetApi();

    async function fetchData(useUnread: boolean, limit: number = 500) {
        let roomEvents: any[] = await widgetApi.receiveRoomEvents('m.room.message');
        return roomEvents;
    }

    useEffect(() => {
        fetchData(false)
            .then((messages) => {
                let messages_text: string[] = []
                messages.forEach((message) => {
                    messages_text.push(message.content.body);
                })

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

    return (
        <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
            {messages.slice(1).map(m => (
                <div key={m.id} className={`${m.role === 'user' ? "bg-gray-400" : "bg-blue"} hover:bg-blue-300`}  onClick={sendMessage} onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)}>
                    {m.content}
                </div>
            ))}

            { hover && <p className="bg-red-400 fixed bottom-20">This will send a message to the chat.</p>}

            <form onSubmit={handleSubmit}>
                <input
                    className="fixed w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2"
                    value={input}
                    onChange={handleInputChange}
                />
                {/*<button type="submit">Send</button>*/}
            </form>
        </div>
    )
}