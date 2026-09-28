import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useDocumentData } from "react-firebase-hooks/firestore";

import useAuth from "hooks/useAuth";
import { isInstalled, isIOS } from "utils/pwa";
import {
  defaultReminder,
  deviceToken,
  pushSupport,
  reminderRef,
  Reminder,
  saveSchedule,
  sendTest,
  turnOff,
  turnOn,
} from "utils/reminders";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Account: a morning notification with today's outfit and the jacket call
const MorningReminder = () => {
  const [user] = useAuth();
  const reference = useMemo(() => user && reminderRef(user.uid), [user]);
  const [saved] = useDocumentData(reference);
  const schedule = {
    time: (saved as Reminder | undefined)?.time ?? defaultReminder.time,
    days: (saved as Reminder | undefined)?.days ?? defaultReminder.days,
  };
  const [support, setSupport] = useState<string>();
  const [isOn, setIsOn] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const toast = useToast();
  const lastSentAt = (saved as Reminder | undefined)?.lastSentAt?.toDate();

  const onTest = async () => {
    setIsBusy(true);
    try {
      const { data } = await sendTest();
      toast({
        status: "success",
        title: "Test sent",
        description: `It should arrive on ${data.sent} device${
          data.sent === 1 ? "" : "s"
        } in a few seconds.`,
        isClosable: true,
      });
    } catch (error) {
      toast({
        status: "error",
        title: "Couldn't send a test",
        description: (error as Error).message,
        isClosable: true,
      });
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    pushSupport().then((state) => {
      setSupport(state);
      setIsOn(state === "granted" && Boolean(deviceToken()));
    });
  }, []);

  const onToggle = async () => {
    setIsBusy(true);
    try {
      if (isOn) {
        await turnOff();
        setIsOn(false);
      } else {
        const isGranted = await turnOn(schedule);
        setIsOn(isGranted);
        if (!isGranted) setSupport(Notification.permission);
      }
    } catch (error) {
      toast({
        status: "error",
        title: "Couldn't change the reminder",
        description: navigator.onLine
          ? "Please try again."
          : "You're offline. Try again once you're back online.",
        isClosable: true,
      });
    } finally {
      setIsBusy(false);
    }
  };

  const toggleDay = (day: number) =>
    saveSchedule({
      ...schedule,
      days: schedule.days.includes(day)
        ? schedule.days.filter((d) => d !== day)
        : [...schedule.days, day].sort(),
    });

  if (!support) return null;

  return (
    <Box
      as="section"
      sx={{ mt: 5, p: 4, borderRadius: "card", backgroundColor: "card" }}
    >
      <FormControl sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel htmlFor="reminder" sx={{ m: 0 }}>
            <Heading as="span" sx={{ fontSize: "xl" }}>
              Morning reminder
            </Heading>
          </FormLabel>
          <Text sx={{ mt: 1, color: "gray.600" }}>
            Today&apos;s outfit and whether it&apos;s a jacket day.
          </Text>
        </Box>
        {(support === "granted" || support === "default") && (
          <Switch
            id="reminder"
            size="lg"
            colorScheme="brand"
            isChecked={isOn}
            isDisabled={isBusy}
            onChange={onToggle}
            sx={{ mt: 1 }}
          />
        )}
      </FormControl>

      {support === "unsupported" && (
        <Text sx={{ mt: 3, fontWeight: "medium" }}>
          {isIOS() && !isInstalled()
            ? "Install Alfred to your Home Screen to get the morning reminder."
            : "This browser can't show Alfred's reminders."}
        </Text>
      )}
      {support === "denied" && (
        <Text sx={{ mt: 3, fontWeight: "medium" }}>
          Notifications are blocked for Alfred. Allow them in your browser
          settings, then come back here.
        </Text>
      )}

      {support !== "unsupported" && (
        <>
          <Flex sx={{ mt: 4, alignItems: "center", gap: 3 }}>
            <Text as="label" htmlFor="reminder-time" sx={{ flex: 1 }}>
              Time
            </Text>
            <Input
              id="reminder-time"
              type="time"
              value={schedule.time}
              onChange={(event) =>
                event.target.value &&
                saveSchedule({ ...schedule, time: event.target.value })
              }
              sx={{ w: "auto" }}
            />
          </Flex>
          <Text sx={{ mt: 4, mb: 2 }}>Days</Text>
          <Flex role="group" aria-label="Days" sx={{ gap: 1 }}>
            {days.map((name, day) => {
              const isPicked = schedule.days.includes(day);
              return (
                <Button
                  key={name}
                  aria-label={name}
                  aria-pressed={isPicked}
                  onClick={() => toggleDay(day)}
                  sx={{
                    flex: 1,
                    minW: 0,
                    px: 0,
                    backgroundColor: isPicked ? "brand.500" : "page",
                    color: isPicked ? "card" : "brand.500",
                    _hover: {
                      backgroundColor: isPicked ? "brand.500" : "page",
                    },
                  }}
                >
                  {name[0]}
                </Button>
              );
            })}
          </Flex>

          {isOn && (
            <Flex sx={{ mt: 4, alignItems: "center", gap: 3 }}>
              <Text sx={{ flex: 1, fontSize: "sm", color: "gray.600" }}>
                {lastSentAt
                  ? `Last sent ${lastSentAt.toLocaleString("en-GB", {
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "Not sent yet"}
              </Text>
              <Button variant="outline" onClick={onTest} isLoading={isBusy}>
                Send a test
              </Button>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};

export default MorningReminder;
