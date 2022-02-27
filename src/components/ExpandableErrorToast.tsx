import { Toast, Detail, useNavigation } from "@raycast/api";

/**
 * ExpandableErrorToast creates a failure toast with the given navigationTitle and title,
 * and offers a primary action that renders a Detail view with the full description as
 * markdown.
 */
export default function ExpandableErrorToast(navigationTitle: string, title: string, description: string) {
  const { push } = useNavigation();
  return new Toast({
    style: Toast.Style.Failure,
    title: title,
    primaryAction: {
      title: "View details",
      onAction: () => {
        push(<Detail markdown={`**${title}**\n\n${description}`} navigationTitle={navigationTitle} />);
      },
    },
  });
}
