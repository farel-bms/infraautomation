# Testing Scripts — LKS 2026

Dua script otomatis: satu untuk siswa (self-check), satu untuk juri (penilaian).

## Setup

```bash
chmod +x testing/student-check.sh testing/jury-assess.sh
```

Prasyarat: `aws` CLI aktif, `jq`, `curl`, `terraform init` sudah dijalankan.

---

## student-check.sh — Untuk Siswa

Jalankan sebelum memanggil juri. Semua bagian harus PASS.

```bash
./testing/student-check.sh
```

Checks: Credentials · Terraform outputs · VPC · Peering · ECR · ECS · ALB + CRUD · Prometheus · CI/CD

---

## jury-assess.sh — Untuk Juri

```bash
./testing/jury-assess.sh "Nama Lengkap Siswa"
```

| Section | Topik | Maks |
|---|---|---|
| A | Networking & VPC | 30 |
| B | Security Groups | 10 |
| C | Database (RDS, DynamoDB, SSM) | 10 |
| D | ECR Repositories | 5 |
| E | ECS Application Services | 20 |
| F | ALB & Full CRUD | 20 |
| G | Prometheus + Inter-Region Peering | 25 |
| H | CI/CD Pipeline | 10 |
| **Total** | | **130** |
