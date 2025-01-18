

interface UpdateHargaProps {
  productName: string;
  factoryName: string;
  newPrice: number;
  oldPrice: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR" 
  }).format(amount).slice(0, -3);
};

export default function UpdateHarga({ productName, factoryName, newPrice, oldPrice }: UpdateHargaProps) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        maxWidth: '600px',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0
          }}>Pembaruan Harga Produk</h1>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          <p style={{
            color: '#374151',
            marginBottom: '1.5rem',
            fontSize: '1rem',
            lineHeight: 1.5
          }}>
            Pemberitahuan perubahan harga untuk:
          </p>

          {/* Product Info Box */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1e40af',
              marginBottom: '0.75rem'
            }}>{productName}</h2>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>Pabrik: {factoryName}</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.375rem',
                backgroundColor: '#fee2e2'
              }}>
                <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                  Harga Sebelumnya:<br />
                  <span style={{
                    display: 'block',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    marginTop: '0.25rem'
                  }}>
                    {formatCurrency(oldPrice)}
                  </span>
                </p>
              </div>

              <div style={{
                padding: '0.75rem',
                borderRadius: '0.375rem',
                backgroundColor: '#dcfce7'
              }}>
                <p style={{ color: '#166534', fontSize: '0.875rem' }}>
                  Harga Terbaru:<br />
                  <span style={{
                    display: 'block',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    marginTop: '0.25rem'
                  }}>
                    {formatCurrency(newPrice)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <p style={{
            color: '#374151',
            fontSize: '1rem',
            lineHeight: 1.5
          }}>
            Silahkan perbarui harga jual Anda di aplikasi untuk menyesuaikan dengan perubahan harga ini.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
          </p>
        </div>
      </div>
    </div>
  );
}