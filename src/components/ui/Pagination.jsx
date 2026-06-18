import styles from "./Pagination.module.css";
import Button from "./Button";

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems = 0,
    itemsPerPage = 10,
}) {
    if (totalPages <= 1) {
        // Jika hanya ada 1 halaman, tampilkan info data saja tanpa navigasi halaman
        if (totalItems > 0) {
            return (
                <div className={styles.container}>
                    <span className={styles.info}>
                        Menampilkan semua <strong>{totalItems}</strong> data barang
                    </span>
                </div>
            );
        }
        return null;
    }

    const startIdx = (currentPage - 1) * itemsPerPage + 1;
    const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

    // Menghasilkan array nomor halaman (misal [1, 2, 3])
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className={styles.container}>
            <span className={styles.info}>
                Menampilkan <strong>{startIdx}-{endIdx}</strong> dari <strong>{totalItems}</strong> data barang
            </span>
            <div className={styles.navigation}>
                <Button
                    variant="secondary"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.navBtn}
                >
                    ◀ Prev
                </Button>
                
                <div className={styles.pagesList}>
                    {pageNumbers.map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`${styles.pageItem} ${
                                currentPage === page ? styles.activePage : ""
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <Button
                    variant="secondary"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.navBtn}
                >
                    Next ▶
                </Button>
            </div>
        </div>
    );
}
