<?php

namespace App\Repository;

use App\Entity\Task;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Task>
 *
 * @method Task|null find($id, $lockMode = null, $lockVersion = null)
 * @method Task|null findOneBy(array $criteria, array $orderBy = null)
 * @method Task[]    findAll()
 * @method Task[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
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
        ?string $search = null
    ): array {
        $qb = $this->createQueryBuilder('t');

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
     * Conta tarefas por status
     */
    public function getTaskStats(): array
    {
        $qb = $this->createQueryBuilder('t');

        $total = $qb->select('COUNT(t.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $completed = $qb->select('COUNT(t.id)')
            ->where('t.completed = true')
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
     * Busca tarefas vencidas
     */
    public function findOverdueTasks(): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.dueDate < :startOfToday')
            ->setParameter('startOfToday', (new \DateTime())->setTime(0, 0, 0))
            ->andWhere('t.completed = false')
            ->setParameter('now', new \DateTime())
            ->orderBy('t.dueDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Busca tarefas por prioridade
     */
    public function findByPriority(string $priority): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.priority = :priority')
            ->setParameter('priority', $priority)
            ->orderBy('t.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Busca categorias disponíveis
     */
    public function getAvailableCategories(): array
    {
        $result = $this->createQueryBuilder('t')
            ->select('DISTINCT t.category')
            ->where('t.category IS NOT NULL')
            ->orderBy('t.category', 'ASC')
            ->getQuery()
            ->getScalarResult();

        return array_column($result, 'category');
    }
}
