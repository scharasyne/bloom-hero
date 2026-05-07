import { loadCustomerPayPage, uploadOrderReceiptProof } from "@/app/actions/order-status";

type CustomerPayOrderPageProps = {
	params: Promise<{ orderId: string }>;
};

export default async function CustomerPayOrderPage({
	params,
}: CustomerPayOrderPageProps) {
	const { orderId } = await params;
	const paymentPage = await loadCustomerPayPage(orderId);

	if (paymentPage.status === "unauthenticated") {
		return (
			<main className="mx-auto w-full max-w-xl px-6 py-10">
				<h1 className="text-2xl font-bold text-[#2f2f2f]">Upload Payment Receipt</h1>
				<p className="mt-2 text-sm text-[#5a5a5a]">You need to sign in to continue.</p>
				<a
					href="/login"
					className="mt-6 inline-flex rounded-full bg-[#d24b46] px-5 py-2 text-sm font-semibold text-white"
				>
					Go to Login
				</a>
			</main>
		);
	}

	if (paymentPage.status === "not-found") {
		return (
			<main className="mx-auto w-full max-w-xl px-6 py-10">
				<h1 className="text-2xl font-bold text-[#2f2f2f]">Upload Payment Receipt</h1>
				<p className="mt-2 text-sm text-[#5a5a5a]">Order not found.</p>
				<a
					href="/orders?tab=to-pay"
					className="mt-6 inline-flex rounded-full border border-[#d9d9d9] px-5 py-2 text-sm font-semibold text-[#4f4f4f]"
				>
					Back to Orders
				</a>
			</main>
		);
	}

	const order = paymentPage.order;
	const receiptUploaded = Boolean(order.receiptProofUrl);

	async function submitReceipt(formData: FormData) {
		"use server";
		formData.set("orderId", orderId);
		await uploadOrderReceiptProof(formData);
	}

	return (
		<main className="mx-auto w-full max-w-xl px-6 py-10">
			<h1 className="text-2xl font-bold text-[#2f2f2f]">Upload Payment Receipt</h1>
			{receiptUploaded ? (
				<div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
					<h2 className="text-lg font-semibold text-emerald-800">Receipt uploaded</h2>
					<p className="mt-2 text-sm text-emerald-700">
						Your receipt has already been submitted. Waiting for vendor confirmation.
					</p>
					<div className="mt-4 flex gap-3">
						<a
							href="/orders?tab=to-ship"
							className="rounded-full bg-[#d24b46] px-5 py-2 text-sm font-semibold text-white"
						>
							Back to Orders
						</a>
					</div>
				</div>
			) : (
				<>
					<p className="mt-2 text-sm text-[#5a5a5a]">
						Upload a clear JPEG or PNG receipt to continue your order.
					</p>

					<form
						action={submitReceipt}
						className="mt-6 space-y-4 rounded-2xl border border-[#f1d3d1] bg-[#fff8f7] p-6"
					>
						<input type="hidden" name="orderId" value={orderId} />

						<label className="block text-sm font-semibold text-[#2f2f2f]" htmlFor="receipt">
							Receipt Image
						</label>
						<input
							id="receipt"
							name="receipt"
							type="file"
							accept="image/png,image/jpeg"
							required
							className="block w-full rounded-lg border border-[#d9d9d9] bg-white px-3 py-2 text-sm"
						/>

						<div className="flex gap-3">
							<button
								type="submit"
								className="rounded-full bg-[#d24b46] px-5 py-2 text-sm font-semibold text-white hover:bg-[#bb3f3a]"
							>
								Submit Receipt
							</button>
							<a
								href="/orders?tab=to-pay"
								className="rounded-full border border-[#d9d9d9] px-5 py-2 text-sm font-semibold text-[#4f4f4f]"
							>
								Back to Orders
							</a>
						</div>
					</form>
				</>
			)}
		</main>
	);
}
