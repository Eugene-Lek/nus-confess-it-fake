import { createTheme } from "@mui/material";

const defaultTheme = createTheme()
export const Theme = createTheme({
    palette: {
        space: defaultTheme.palette.augmentColor({
            color: {
                main: "#51361a"
            },
            name: "space"
        }), 
        orange: defaultTheme.palette.augmentColor({
            color: {
                main: "#F3A953"
            }
        }),
        khaki: defaultTheme.palette.augmentColor({
            color: {
                main: "#946846"
            }
        }),
        offWhite: defaultTheme.palette.augmentColor({
            color: {
                main: "#F2F3F3"
            }
        }),
    },
});


// Augment the palette to include this palette
declare module '@mui/material/styles' {
    interface Palette {
        space?: Palette["primary"];
        orange: Palette["primary"];
        khaki: Palette["primary"];
        offWhite: Palette["primary"];
    }
    interface PaletteOptions {
        space?: PaletteOptions["primary"];
        orange: PaletteOptions["primary"];
        khaki: PaletteOptions["primary"];
        offWhite: PaletteOptions["primary"];
    }
}

// Update the Button's color options to include these options
declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        space: true, 
        orange: true,
        khaki: true,
        offWhite: true,
    }
  }

  declare module '@mui/material/Typography' {
    interface TypographyPropsColorOverrides {
        space: true, 
        orange: true,
        khaki: true,
        offWhite: true,
    }
  }

