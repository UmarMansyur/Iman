
  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Edit Transaksi</h3>
            </div>
          </CardTitle>
          <CardDescription>
            Masukkan detail transaksi untuk menambah invoice.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {isLoading ? (
            <Loader />
          ) : (
            <div className="absolute top-0 right-0 text-sm text-gray-500 mr-4 mt-2">
              <span className="text-red-500">*</span> Wajib diisi
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Toggle Switch */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="invoice-type"
                  checked={isProduct}
                  onCheckedChange={setIsProduct}
                />
                <Label htmlFor="invoice-type">
                  {isProduct ? "Transaksi Produk" : "Transaksi Non-Produk"}
                </Label>
              </div>

              {/* Basic Invoice Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyer">
                    Pembeli <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    required 
                    placeholder="Masukkan nama pembeli"
                    value={invoiceData.buyer}
                    onChange={(e) => setInvoiceData({ ...invoiceData, buyer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyer_address">
                    Alamat Pembeli <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    required 
                    placeholder="Masukkan alamat pembeli"
                    value={invoiceData.buyer_address}
                    onChange={(e) => setInvoiceData({ ...invoiceData, buyer_address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="down_payment">
                    Uang Muka <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    inputMode="numeric"
                    required
                    placeholder="Masukkan jumlah uang muka"
                    value={formatNumber(invoiceData.down_payment)}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        down_payment: unformatNumber(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discon_member">
                    Diskon Member <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    required 
                    placeholder="Masukkan diskon member"
                    value={invoiceData.discon_member}
                    onChange={(e) => setInvoiceData({ ...invoiceData, discon_member: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">
                    Metode Pembayaran <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    value={invoiceData.payment_method_id}
                    onValueChange={(value) => {
                      if(value) {
                        setInvoiceData((prev: any) => ({
                          ...prev,
                          payment_method_id: value,
                        }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Metode Pembayaran">
                        {paymentMethods.find(
                          (method: any) =>
                            method.id == invoiceData.payment_method_id
                        )?.name || "Pilih Metode Pembayaran"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {paymentMethods.map((method: any) => (
                          <SelectItem
                            key={method.id}
                            value={method.id.toString()}
                          >
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maturity_date">
                    Tanggal Jatuh Tempo <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !invoiceData.maturity_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceData.maturity_date ? (
                          // gunakan format tanggal dengan format indonesia
                          format(new Date(invoiceData.maturity_date), "PPP", {
                            locale: id,
                          })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          invoiceData.maturity_date
                            ? new Date(invoiceData.maturity_date)
                            : undefined
                        }
                        onSelect={(date) =>
                          setInvoiceData((prev) => ({
                            ...prev,
                            maturity_date: date
                              ? format(date, "yyyy-MM-dd")
                              : "",
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="catatan">Catatan: </Label>
                  <Textarea
                    id="catatan"
                    name="catatan"
                    value={invoiceData.desc}
                    onChange={(e) =>
                      setInvoiceData({ ...invoiceData, desc: e.target.value })
                    }
                    placeholder="Keterangan pembelian"
                  />
                </div>
              </div>

              {/* Shipping and Location Details */}
              <div className="border-t mt-4 pt-4">
                <h4 className="font-medium mb-4">
                  Informasi Pengiriman & Lokasi
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping_address">
                      Alamat Pengiriman <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      required 
                      placeholder="Masukkan alamat pengiriman"
                      value={invoiceData.shipping_address}
                      onChange={(e) => setInvoiceData({ ...invoiceData, shipping_address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping_cost">
                      Biaya Pengiriman <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      inputMode="numeric"
                      required
                      placeholder="Masukkan biaya pengiriman"
                      onChange={(e) =>
                        setInvoiceData({
                          ...invoiceData,
                          shipping_cost: unformatNumber(e.target.value),
                        })
                      }
                      value={formatNumber(invoiceData.shipping_cost)}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="notes">Keterangan</Label>
                    <Textarea 
                      placeholder="Masukkan keterangan tambahan jika ada"
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Detail Items Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Detail Item</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                    onClick={handleAddDetail}
                  >
                    + Tambah Item
                  </Button>
                </div>

                <div className="relative overflow-x-auto">
                  {details.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium">Keranjang Kosong</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Mulai dengan menambahkan item ke keranjang
                        </p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-50">
                        <tr>
                          <th className="px-4 py-2">
                            Deskripsi <span className="text-red-500">*</span>
                          </th>
                          <th className="px-4 py-2">
                            Jumlah <span className="text-red-500">*</span>
                          </th>
                          <th className="px-4 py-2">
                            Harga <span className="text-red-500">*</span>
                          </th>
                          <th className="px-4 py-2">Diskon (%)</th>
                          <th className="px-4 py-2">Sub Total</th>
                          <th className="px-4 py-2">Uang Muka</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.map((detail, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">
                              {isProduct ? (
                                <div>
                                  <Select
                                    value={detail.desc}
                                    onValueChange={(value) => handleDetailChange(index, "desc", value)}
                                    disabled={index !== details.length - 1}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih Produk">
                                        {detail.desc || "Pilih Produk"}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        {products.map((product: any) => (
                                          <SelectItem
                                            key={product.id}
                                            value={product.name}
                                            disabled={product.stock <= 0}
                                          >
                                            {product.name} - {product.type} - (Stok: {product.stock})
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                  {products.find(
                                    (product: any) => product.name == detail.desc
                                  ) && (
                                    <input
                                      type="hidden"
                                      name="product_id"
                                      value={
                                        products.find(
                                          (product: any) =>
                                            product.name == detail.desc
                                        )?.id
                                      }
                                    />
                                  )}
                                </div>
                              ) : (
                                <Input
                                  value={detail.desc}
                                  onChange={(e) => handleDetailChange(index, "desc", e.target.value)}
                                  placeholder="Deskripsi item"
                                  disabled={index !== details.length - 1}
                                />
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="text"
                                value={formatNumber(detail.amount) || ''}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                className={
                                  isProduct &&
                                  isExceedingStock(detail.desc, detail.amount)
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                                }
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="text"
                                value={formatNumber(detail.price) || ''}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "price",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                disabled={isProduct}
                                className={isProduct ? "bg-gray-50" : ""}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="text"
                                value={formatNumber(detail.discount) || ''}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "discount",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="text"
                                value={formatNumber(detail.sub_total) || ''}
                                disabled
                                className="bg-gray-50"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDetail(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              <span className="text-red-500 text-xs">
                Jika jumlah melebihi stock yang tersedia, maka inputan jumlah akan berwarna merah.
              </span>
              {/* Summary Section */}
              <div className="border-t mt-2 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Sub Total:</span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(total)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Biaya Pengiriman:
                        </span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(invoiceData.shipping_cost)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Uang Muka:</span>
                        <span className="font-semibold">
                          - {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(invoiceData.down_payment)}
                        </span>
                      </div>


                      <div className="flex justify-between items-center text-lg border-t pt-2">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-blue-600">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(
                            total +
                              invoiceData.shipping_cost
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Sisa Pembayaran</Label>
                    <div
                      className={`p-2 rounded-md font-semibold text-right ${
                        total +
                          invoiceData.shipping_cost +
                     
                          invoiceData.down_payment >
                        0
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(
                        total +
                          invoiceData.shipping_cost - invoiceData.down_payment
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={hasExceedingStock()}
                className={hasExceedingStock() ? "opacity-50 cursor-not-allowed" : ""}
              >
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </MainPage>
  );
}
