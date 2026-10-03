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
} from "@chakra-ui/react";
import useNotice from "hooks/useNotice";
import { useDocumentData } from "react-firebase-hooks/firestore";

import useAuth from "hooks/useAuth";
import { describeDays, nextReminder } from "utils/nextReminder";
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

// Account: a morning nudge to the next outfit, with the weather
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
  const toast = useNotice();
  // Changes are a draft until saved, like setting an alarm
  const [draft, setDraft] = useState<typeof schedule | null>(null);
  const shown = draft ?? schedule;
  const isDirty =
    draft !== null &&
    (draft.time !== schedule.time ||
      draft.days.join() !== schedule.days.join());

  const confirm = (set: typeof schedule, isOnHere: boolean) => {
    const next = nextReminder(new Date(), set.time, set.days);
    toast({
      status: "success",
      title: `Reminder set for ${set.time}, ${describeDays(set.days)}`,
      description: !isOnHere
        ? "Switch it on to get it on this phone."
        : next
          ? `Next one: ${next}.`
          : undefined,
    });
  };

  const onSave = async () => {
    if (!draft) return;
    setIsBusy(true);
    try {
      await saveSchedule(draft);
      setDraft(null);
      confirm(draft, isOn);
    } catch {
      toast({
        status: "error",
        title: "Couldn't save the reminder",
        description: "Nothing was changed. Please try again.",
      });
    } finally {
      setIsBusy(false);
    }
  };
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
      });
    } catch (error) {
      toast({
        status: "error",
        title: "Couldn't send a test",
        description: (error as Error).message,
      });
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    pushSupport()
      .then((state) => {
        setSupport(state);
        setIsOn(state === "granted" && Boolean(deviceToken()));
      })
      .catch(() => setSupport("unsupported"));
  }, []);

  const onToggle = async () => {
    setIsBusy(true);
    try {
      if (isOn) {
        await turnOff();
        setIsOn(false);
      } else {
        const isGranted = await turnOn(shown);
        setIsOn(isGranted);
        if (isGranted) {
          setDraft(null);
          confirm(shown, true);
        } else setSupport(Notification.permission);
      }
    } catch {
      toast({
        status: "error",
        title: "Couldn't change the reminder",
        description: navigator.onLine
          ? "Please try again."
          : "You're offline. Try again once you're back online.",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const toggleDay = (day: number) =>
    setDraft({
      ...shown,
      days: shown.days.includes(day)
        ? shown.days.filter((d) => d !== day)
        : [...shown.days, day].sort(),
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
          <Text sx={{ mt: 1, color: "muted" }}>
            A nudge to move on to the next outfit, with the weather.
          </Text>
          {support !== "unsupported" && support !== "denied" && (
            // What's set, at a glance (the saved schedule, not a draft)
            <Text sx={{ mt: 2, fontSize: "sm", fontWeight: "medium" }}>
              {`Set for ${schedule.time}, ${describeDays(schedule.days)} · `}
              {isOn
                ? `next one ${
                    nextReminder(new Date(), schedule.time, schedule.days) ??
                    "when you pick a day"
                  }`
                : "off on this phone"}
            </Text>
          )}
        </Box>
        {(support === "granted" || support === "default") && (
          <Switch
            id="reminder"
            size="lg"
            colorScheme="brand"
            isChecked={isOn}
            // Switching on needs at least one day ("Pick at least one day")
            isDisabled={isBusy || (!isOn && shown.days.length === 0)}
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
              value={shown.time}
              onChange={(event) =>
                event.target.value &&
                setDraft({ ...shown, time: event.target.value })
              }
              sx={{ w: "auto" }}
            />
          </Flex>
          <Text sx={{ mt: 4, mb: 2 }}>Days</Text>
          <Flex role="group" aria-label="Days" sx={{ gap: 1 }}>
            {days.map((name, day) => {
              const isPicked = shown.days.includes(day);
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
                    backgroundColor: isPicked ? "ink" : "page",
                    color: isPicked ? "card" : "ink",
                    _hover: {
                      backgroundColor: isPicked ? "ink" : "page",
                    },
                  }}
                >
                  {name[0]}
                </Button>
              );
            })}
          </Flex>

          {isDirty && (
            <Flex sx={{ mt: 4, gap: 2 }}>
              <Button
                variant="outline"
                onClick={() => setDraft(null)}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={onSave}
                isLoading={isBusy}
                isDisabled={shown.days.length === 0}
                sx={{ flex: 1 }}
              >
                Save
              </Button>
            </Flex>
          )}
          {shown.days.length === 0 && (
            <Text sx={{ mt: 2, fontSize: "sm", color: "muted" }}>
              Pick at least one day.
            </Text>
          )}

          {isOn && !isDirty && (
            <Flex sx={{ mt: 4, alignItems: "center", gap: 3 }}>
              <Text sx={{ flex: 1, fontSize: "sm", color: "muted" }}>
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
