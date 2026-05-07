import VendorAddProductPage from "@/app/(vendor)/_components/AddProduct";

export default function PopupAddProduct(){
    return(
        <div className="p-4 sm:p-6 lg:p-8">
            <VendorAddProductPage type="pop-up" />
        </div>
    )
};
