import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-2xl",
            headerTitle: "text-2xl font-bold",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all",
            socialButtonsBlockButtonText: "font-semibold",
            dividerLine: "bg-gray-200 dark:bg-gray-700",
            dividerText: "text-muted-foreground",
            formButtonPrimary: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white",
            footerActionLink: "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300",
            identityPreviewText: "text-gray-700 dark:text-gray-300",
            identityPreviewEditButton: "text-purple-600 hover:text-purple-700",
          },
          layout: {
            socialButtonsPlacement: "top",
            socialButtonsVariant: "blockButton",
          },
          variables: {
            borderRadius: "0.75rem",
          }
        }}
        afterSignUpUrl="/quiz"
      />
    </div>
  )
}