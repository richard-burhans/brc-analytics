import { HG_PAGE_META } from "@highgen/meta/constants";
import { AboutView } from "@highgen/views/AboutView/aboutView";
import { StyledPagesMain } from "@repo/shared/components/layout/Main/main.styles";
import type { ThemedPageProps } from "@repo/shared/meta/types";
import { SMOKE_LIGHTEST } from "@repo/shared/styles/palette";
import { type GetStaticProps } from "next";
import { type JSX } from "react";

const Page = (): JSX.Element => {
  return <AboutView />;
};

export const getStaticProps: GetStaticProps<ThemedPageProps> = async () => {
  return {
    props: {
      ...HG_PAGE_META.ABOUT,
      themeOptions: {
        palette: { background: { default: SMOKE_LIGHTEST } },
      },
    },
  };
};

export default Page;

Page.Main = StyledPagesMain;
