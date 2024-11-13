'use client';

import Loader from '@/components/Loader';
import { getClerkUsers, getDocumentUsers } from '@/lib/actions/user.actions';
import { useUser } from '@clerk/nextjs';
import { ClientSideSuspense, LiveblocksProvider } from '@liveblocks/react/suspense';
import { ReactNode } from 'react';

const Provider = ({ children }: { children: ReactNode}) => {
  const { user: clerkUser } = useUser();

  return (
    <LiveblocksProvider 
      authEndpoint="/api/liveblocks-auth"

      //Mainly used to get info of the users for comments, it gives you email id's, then you can use
      //these emails to fetch user info from your DB and return an array of users in the userMeta["info"] format.
      resolveUsers={async ({ userIds }) => {
        const users = await getClerkUsers({ userIds});

        return users;
      }}

      //user to mention users using @ in comment.
      //text is the string which user types in the liveblock UI to search for other users. 
      resolveMentionSuggestions={async ({ text, roomId }) => {
        const roomUsers = await getDocumentUsers({
          roomId,
          currentUser: clerkUser?.emailAddresses[0].emailAddress!,//one out if may email address.
          text,
        })

        return roomUsers;
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>
        {children}
      </ClientSideSuspense>
    </LiveblocksProvider>
  )
}

export default Provider