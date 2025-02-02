import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-notifications";
import { registerForPushNotificationsAsync } from "../services/registerForPushNotificationsAsync";
import { useAuthState } from "./AuthContext";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// const {expoPushToken, notification, error} = useNotification()
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { userId } = useAuthState();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<EventSubscription>();
  const responseListener = useRef<EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      //if we get the token, set it
      (token) => setExpoPushToken(token),
      //if we get an error (that is thrown), set it
      (error) => setError(error)
    );

    //listen for notifications received when the app is in the foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "🔔 Notification Received while the app is running: ",
          JSON.stringify(notification?.request.content.data, null, 2)
        );
        setNotification(notification);
      });

    //listen for notification responses of the user. meaning, if the user taps on the notification, this will be triggered
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        //the difference between notification and response is that response has the notification object + the user response
        console.log(
          "🔔 Notification Response when user interacts with a notification: ",
          JSON.stringify(response.notification.request.content.data, null, 2)
        );
        // Handle the notification response here
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/*

notification response example:


{
  "actionIdentifier": "expo.modules.notifications.actions.DEFAULT",
  "notification": {
    "request": {
      "trigger": {
        "channelId": null,
        "type": "push"
  "actionIdentifier": "expo.modules.notifications.actions.DEFAULT",
  "notification": {
    "request": {
      "trigger": {
        "channelId": null,
        "type": "push"
      },
      "content": {
        "title": "message tilte",
      "trigger": {
        "channelId": null,
        "type": "push"
      },
      "content": {
        "title": "message tilte",
      },
      "content": {
        "title": "message tilte",
        "body": "message body",
        "data": {
        "title": "message tilte",
        "body": "message body",
        "data": {
        "body": "message body",
        "data": {
          "data": "JSON",
          "sender": 123456
        }
      },
      "identifier": "0:1738491810499284%76946d9a76946d9a"
    },
    "date": 1738491810490
  }


  notification example:

  notification {
  "date": 1738492133986,
  "request": {
    "trigger": {
      "remoteMessage": {
        "originalPriority": 2,
        "sentTime": 1738492133986,
        "notification": {
          "usesDefaultVibrateSettings": false,
          "color": null,
          "channelId": null,
          "visibility": null,
          "sound": null,
          "tag": null,
          "bodyLocalizationArgs": null,
          "imageUrl": null,
          "title": "message tilte",
          "ticker": null,
          "eventTime": null,
          "body": "message body",
          "titleLocalizationKey": null,
          "notificationPriority": null,
          "icon": null,
          "usesDefaultLightSettings": false,
          "sticky": false,
          "link": null,
          "titleLocalizationArgs": null,
          "bodyLocalizationKey": null,
          "usesDefaultSound": false,
          "clickAction": null,
          "localOnly": false,
          "lightSettings": null,
          "notificationCount": null
        },
        "data": {
          "message": "message body",
          "title": "message tilte",
          "body": "{\"data\":\"JSON\",\"sender\":123456}",
          "scopeKey": "@deepkfiz/chat-app",
          "experienceId": "@deepkfiz/chat-app",
          "projectId": "01d12cfd-d957-4458-a440-f57f83e8610f"
        },
        "to": null,
        "ttl": 2419200,
        "collapseKey": "il.co.elobby.tilk",
        "messageType": null,
        "priority": 2,
        "from": "1098041801299",
        "messageId": "0:1738492133995549%76946d9a76946d9a"
      },
      "type": "push"
    },
    "content": {
      "autoDismiss": true,
      "body": "message body",
      "sound": "default",
      "sticky": false,
      "title": "message tilte",
      "badge": null,
      "priority": "default",
      "subtitle": null,
      "data": {
        "data": "JSON",
        "sender": 123456
      }
    },
    "identifier": "0:1738492133995549%76946d9a76946d9a"
  }
}
*/
