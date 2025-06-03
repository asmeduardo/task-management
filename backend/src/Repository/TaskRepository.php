<?php

namespace App\Repository;

use App\Entity\Task;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Task>
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    /**
     * Busca tarefas com filtros opcionais
     */
    public function findByFilters(
        ?bool $completed = null,
        ?string $priority = null,
        ?string $category = null,
        ?string $search = null,
        ?User $user = null
    ): array {
        $qb = $this->createQueryBuilder('t');

        // Filtrar por usuário sempre
        if ($user) {
            $qb->andWhere('t.user = :user')
                ->setParameter('user', $user);
        }

        if ($completed !== null) {
            $qb->andWhere('t.completed = :completed')
                ->setParameter('completed', $completed);
        }

        if ($priority !== null) {
            $qb->andWhere('t.priority = :priority')
                ->setParameter('priority', $priority);
        }

        if ($category !== null) {
            $qb->andWhere('t.category = :category')
                ->setParameter('category', $category);
        }

        if ($search !== null) {
            $qb->andWhere('t.title LIKE :search OR t.description LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        return $qb->orderBy('t.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Conta tarefas por status para um usuário específico
     */
    public function getTaskStats(User $user): array
    {
        $total = $this->createQueryBuilder('t_total')
            ->select('COUNT(t_total.id)')
            ->where('t_total.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();

        $completed = $this->createQueryBuilder('t_completed')
            ->select('COUNT(t_completed.id)')
            ->where('t_completed.completed = true')
            ->andWhere('t_completed.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();

        $pending = $total - $completed;

        return [
            'total' => (int) $total,
            'completed' => (int) $completed,
            'pending' => (int) $pending
        ];
    }

    /**
     * Busca tarefas vencidas para um usuário
     */
    public function findOverdueTasks(User $user): array
    {
        $now = new \DateTime();
        
        return $this->createQueryBuilder('t')
            ->where('t.dueDate < :now')
            ->andWhere('t.completed = false')
            ->andWhere('t.user = :user')
            ->setParameter('now', $now)
            ->setParameter('user', $user)
            ->orderBy('t.dueDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Busca categorias disponíveis para um usuário
     */
    public function getAvailableCategories(User $user): array
    {
        $result = $this->createQueryBuilder('t')
            ->select('DISTINCT t.category')
            ->where('t.category IS NOT NULL')
            ->andWhere('t.user = :user')
            ->setParameter('user', $user)
            ->orderBy('t.category', 'ASC')
            ->getQuery()
            ->getScalarResult();

        return array_column($result, 'category');
    }
}