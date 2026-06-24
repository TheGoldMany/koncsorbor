import { ForgotForm } from "@/components/account/ForgotForm";

export const metadata = { title: "Elfelejtett jelszó" };

export default function ForgotPage() {
  return (
    <div className="container-kb max-w-md py-14">
      <h1 className="mb-2 text-3xl font-bold text-leather-900">Elfelejtett jelszó</h1>
      <p className="mb-6 text-leather-600">
        Add meg a fiókodhoz tartozó e-mail címet, és küldünk egy linket az új jelszó beállításához.
      </p>
      <ForgotForm />
    </div>
  );
}
