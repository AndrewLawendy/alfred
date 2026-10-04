import { ReactNode } from "react";
import { Box, Flex, Icon, Image } from "@chakra-ui/react";
import { MdPhotoCamera } from "react-icons/md";

import OutfitItem from "components/OutfitItem";
import { layoutOf } from "utils/wardrobe";
import { Item } from "utils/types";

type PhotoLayoutProps = {
  photoUrl: string;
  title?: string;
  pieces: Item[];
  badge?: (item: Item) => ReactNode;
  // The brass ring and camera mark on the photo (the outfit screen)
  isMarked?: boolean;
  // Tapping the photo, as tapping a piece opens it
  onPhoto?: () => void;
};

const GAP = 8;
const HEIGHT = "var(--outfit-height, 440px)";
// The row under the photo, about a quarter of the outfit's height
const UNDER = `calc(${HEIGHT} * 0.24)`;
// The column beside the photo never gets narrower than this
const BESIDE_MIN = 110;

// An outfit with its own photo: the photo keeps the 3:4 shape phones shoot
// in, so a whole person shows uncropped. Its pieces wrap it, beside first,
// then under: 1–2 beside; 3 as 2 + 1; then half and half (3 + 3 for six).
const PhotoLayout = ({
  photoUrl,
  title,
  pieces,
  badge,
  isMarked,
  onPhoto,
}: PhotoLayoutProps) => {
  const { main, side, small } = layoutOf(pieces);
  const sorted = [...main, ...side, ...small];
  const besideCount =
    sorted.length <= 2 ? sorted.length : Math.ceil(sorted.length / 2);
  const beside = sorted.slice(0, besideCount);
  const under = sorted.slice(besideCount);

  // The photo's height: the outfit's, less the row under it, and no taller
  // than leaves the column beside it its minimum width
  const photoHeight = !sorted.length
    ? `min(${HEIGHT}, calc(100cqw / 0.75))`
    : `min(calc(${HEIGHT} - ${under.length ? `${UNDER} - ${GAP}px` : "0px"}), calc((100cqw - ${BESIDE_MIN + GAP}px) / 0.75))`;

  const tile = (item: Item, height: string, isSingle = false) => (
    <Box
      key={item.id}
      style={{ "--outfit-photo-height": height } as React.CSSProperties}
      sx={{
        flex: isSingle ? "none" : 1,
        minW: 0,
        w: isSingle ? UNDER : undefined,
      }}
    >
      <OutfitItem
        id={item.id}
        type={item.type}
        title={item.title}
        imageUrl={item.imageUrl}
        badge={badge?.(item)}
        radius="thumb"
      />
    </Box>
  );

  return (
    <Box
      style={{ "--photo-height": photoHeight } as React.CSSProperties}
      sx={{ containerType: "inline-size" }}
    >
      <Flex
        sx={{
          gap: `${GAP}px`,
          justifyContent: sorted.length ? "start" : "center",
        }}
      >
        <Box
          {...(onPhoto && {
            as: "button",
            onClick: onPhoto,
            "aria-label": title,
          })}
          sx={{
            position: "relative",
            flexShrink: 0,
            borderRadius: "card",
            transition: "transform 0.1s",
            _active: { transform: "scale(0.98)" },
            // Marked as the look itself, as its swatch is in the list
            ...(isMarked && {
              boxShadow:
                "0 0 0 3px var(--chakra-colors-page), 0 0 0 5px var(--chakra-colors-accent-500)",
            }),
          }}
        >
          <Image
            src={photoUrl}
            alt={title ?? ""}
            sx={{
              display: "block",
              h: "var(--photo-height)",
              w: "calc(var(--photo-height) * 0.75)",
              objectFit: "cover",
              borderRadius: "card",
              backgroundColor: "surface",
            }}
          />
          {isMarked && (
            <Flex
              aria-hidden
              sx={{
                position: "absolute",
                left: 2,
                top: 2,
                w: 7,
                h: 7,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "full",
                backgroundColor: "card",
                color: "accentText",
              }}
            >
              <Icon as={MdPhotoCamera} sx={{ w: 4, h: 4 }} />
            </Flex>
          )}
        </Box>
        {beside.length > 0 && (
          <Flex
            role="group"
            aria-label="Pieces"
            sx={{ flex: 1, minW: 0, flexDirection: "column", gap: `${GAP}px` }}
          >
            {beside.map((item) =>
              tile(
                item,
                `calc((var(--photo-height) - ${(beside.length - 1) * GAP}px) / ${beside.length})`
              )
            )}
          </Flex>
        )}
      </Flex>
      {under.length > 0 && (
        <Flex
          role="group"
          aria-label="More pieces"
          sx={{ mt: `${GAP}px`, gap: `${GAP}px` }}
        >
          {/* A lone piece under the photo stays square, not a wide band */}
          {under.map((item) => tile(item, UNDER, under.length === 1))}
        </Flex>
      )}
    </Box>
  );
};

export default PhotoLayout;
