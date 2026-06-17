import styles from './not_found.module.css';

export default function NotFound() {
    return (
        <div>
            <div className={styles.notFound}>
                <h1>
                    404
                </h1>
                <h2>
                    Oops! Halaman yang Anda cari tidak ditemukan.
                </h2>
                <h2>
                    kembali ke <a href="/">Beranda</a>
                </h2>
            </div>
        </div>
    )
}