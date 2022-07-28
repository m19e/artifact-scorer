import Head from "next/head"
import type {
  NextPage,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next"
import { parse } from "next-useragent"

import Scorer from "@/components/templates/Scorer"

type Props = {
  isMobile: boolean
}

const Page: NextPage<Props> = ({ isMobile }) => {
  return (
    <>
      <Head>
        <link
          rel="icon alternate"
          type="image/svg+xml"
          href="https://twemoji.maxcdn.com/v/latest/svg/2696.svg"
        />
        <title>聖遺物スコアラ #ArtifactScorer</title>
        <meta
          name="description"
          content="「#ArtifactScorer」は原神のスクリーンショットから聖遺物データの読み取り・聖遺物スコアの算出・聖遺物の管理が簡単にできるサービスです。"
        />
        <meta property="og:site_name" content="#ArtifactScorer" />
        <meta property="og:title" content="#ArtifactScorer" />
        <meta
          property="og:description"
          content="「#ArtifactScorer」は原神のスクリーンショットから聖遺物データの読み取り・聖遺物スコアの算出・聖遺物の管理が簡単にできるサービスです。"
        />
        <meta
          property="og:image"
          content="https://artifact-scorer.vercel.app/scale.png"
        />
        <meta property="og:type" content="website" />
        <meta property="twitter:title" content="#ArtifactScorer" />
        <meta
          property="twitter:description"
          content="「#ArtifactScorer」は原神のスクリーンショットから聖遺物データの読み取り・聖遺物スコアの算出・聖遺物の管理が簡単にできるサービスです。"
        />
        <meta
          property="twitter:image"
          content="https://artifact-scorer.vercel.app/scale.png"
        />
        <meta
          property="twitter:url"
          content="https://artifact-scorer.vercel.app"
        />
        <meta property="twitter:card" content="summary" />
      </Head>

      <Scorer />
    </>
  )
}

export const getServerSideProps = ({
  req,
}: GetServerSidePropsContext): GetServerSidePropsResult<Props> => {
  const { isMobile } = parse(req.headers["user-agent"] ?? "")

  return {
    props: {
      isMobile,
    },
  }
}

export default Page
