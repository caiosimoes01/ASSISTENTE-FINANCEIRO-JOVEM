import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/components/young-finance/App";

export const Route = createFileRoute("/")({
  component: App,
  head: () => ({
    meta: [
      { title: "YoungFinance — seu assistente jovem financeiro" },
      {
        name: "description",
        content:
          "Simule investimentos, compare cenários, conheça produtos e aprenda HP-12C. Tudo em um só lugar, em Dark Mode Premium.",
      },
    ],
  }),
});
